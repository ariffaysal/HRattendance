import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { SQL_CONNECTION } from '../../database/database.module';

@Injectable()
export class LibraryService {
  constructor(@Inject(SQL_CONNECTION) private readonly db: mysql.Connection) {}

  // Policies
  async getAllPolicies(search?: string) {
    let query = `
      SELECT 
        p.*,
        COUNT(r.id) as rule_count
      FROM library_policies p
      LEFT JOIN library_policy_rules r ON p.id = r.policy_id
    `;
    
    if (search) {
      query += ` WHERE p.policy_name LIKE ? OR p.policy_code LIKE ? OR p.category LIKE ?`;
    }
    
    query += ` GROUP BY p.id ORDER BY p.policy_name`;
    
    const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  async getPolicyById(id: number) {
    const [rows] = await this.db.execute(
      'SELECT * FROM library_policies WHERE id = ?',
      [id],
    );
    const policies = rows as any[];
    if (policies.length === 0) {
      throw new NotFoundException('Policy not found');
    }
    return policies[0];
  }

  async createPolicy(data: any) {
    const [result] = await this.db.execute(
      `INSERT INTO library_policies 
       (policy_code, policy_name, description, category, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.policy_code,
        data.policy_name,
        data.description || null,
        data.category || null,
        data.is_active !== false,
      ],
    );
    
    // Create default rules for the policy
    const policyId = (result as any).insertId;
    await this.createDefaultRules(policyId);
    
    return { id: policyId, ...data };
  }

  async updatePolicy(id: number, data: any) {
    await this.db.execute(
      `UPDATE library_policies 
       SET policy_code = ?, policy_name = ?, description = ?, 
           category = ?, is_active = ?
       WHERE id = ?`,
      [
        data.policy_code,
        data.policy_name,
        data.description || null,
        data.category || null,
        data.is_active,
        id,
      ],
    );
    return { id, ...data };
  }

  async deletePolicy(id: number) {
    // Rules will be deleted automatically due to ON DELETE CASCADE
    await this.db.execute(
      'DELETE FROM library_policies WHERE id = ?',
      [id],
    );
    return { success: true };
  }

  // Policy Rules
  async getRulesByPolicy(policyId: number) {
    const [rows] = await this.db.execute(
      `SELECT * FROM library_policy_rules 
       WHERE policy_id = ? 
       ORDER BY rule_code`,
      [policyId],
    );
    return rows;
  }

  async createRule(policyId: number, data: any) {
    const [result] = await this.db.execute(
      `INSERT INTO library_policy_rules 
       (policy_id, rule_code, rule_name, description, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        policyId,
        data.rule_code,
        data.rule_name,
        data.description || null,
        data.is_active !== false,
      ],
    );
    return { id: (result as any).insertId, policy_id: policyId, ...data };
  }

  async updateRule(ruleId: number, data: any) {
    // Build dynamic query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (data.rule_code !== undefined) {
      updates.push('rule_code = ?');
      values.push(data.rule_code);
    }
    if (data.rule_name !== undefined) {
      updates.push('rule_name = ?');
      values.push(data.rule_name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }
    if (data.conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(data.conditions ? JSON.stringify(data.conditions) : null);
    }
    if (data.calculation_formula !== undefined) {
      updates.push('calculation_formula = ?');
      values.push(data.calculation_formula || null);
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 0) {
      return { id: ruleId };
    }

    values.push(ruleId);
    await this.db.execute(
      `UPDATE library_policy_rules SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );
    return { id: ruleId, ...data };
  }

  async deleteRule(ruleId: number) {
    await this.db.execute(
      'DELETE FROM library_policy_rules WHERE id = ?',
      [ruleId],
    );
    return { success: true };
  }

  // Get active policies with their rules (for dropdowns)
  async getActivePoliciesWithRules() {
    const [rows] = await this.db.execute(
      `SELECT * FROM library_policies 
       WHERE is_active = true 
       ORDER BY policy_name`,
    );
    const policies = rows as any[];
    
    for (const policy of policies) {
      const [rules] = await this.db.execute(
        `SELECT id, rule_code, rule_name, description 
         FROM library_policy_rules 
         WHERE policy_id = ? AND is_active = true 
         ORDER BY rule_code`,
        [policy.id],
      );
      policy.rules = rules;
    }
    
    return policies;
  }

  // Helper to create default rules
  private async createDefaultRules(policyId: number) {
    const defaultRules = [
      { code: 'RULE_1', name: 'Rule 1', desc: 'Standard rule - Default configuration' },
      { code: 'RULE_2', name: 'Rule 2', desc: 'Secondary rule - Alternative configuration' },
      { code: 'RULE_3', name: 'Rule 3', desc: 'Special case rule - Exception handling' },
      { code: 'NA', name: 'N/A', desc: 'Not Applicable - Policy does not apply' },
    ];
    
    for (const rule of defaultRules) {
      await this.db.execute(
        `INSERT INTO library_policy_rules 
         (policy_id, rule_code, rule_name, description, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        [policyId, rule.code, rule.name, rule.desc, true],
      );
    }
  }
}
