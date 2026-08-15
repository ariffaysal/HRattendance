import { Test } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { SQL_CONNECTION } from '../../database/database.module';

describe('AuditService', () => {
  let auditService: AuditService;
  let db: { execute: jest.Mock };

  beforeEach(async () => {
    db = { execute: jest.fn().mockResolvedValue([[], { rowCount: 1 }]) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: SQL_CONNECTION, useValue: db },
      ],
    }).compile();
    auditService = moduleRef.get(AuditService);
  });

  it('inserts an audit entry with all fields', async () => {
    await auditService.log({
      action: 'update',
      entity: 'employee-salary-information',
      entityId: '42',
      actorId: 3,
      actorEmployeeId: 'EMP003',
      details: { before: { gross: 100 }, after: { gross: 120 } },
      ip: '127.0.0.1',
    });

    const [sql, values] = db.execute.mock.calls[0];
    expect(sql).toContain('INSERT INTO audit_logs');
    expect(values[0]).toBe(3);
    expect(values[1]).toBe('EMP003');
    expect(values[2]).toBe('update');
    expect(values[3]).toBe('employee-salary-information');
    expect(values[4]).toBe('42');
    expect(JSON.parse(values[5])).toEqual({ before: { gross: 100 }, after: { gross: 120 } });
    expect(values[6]).toBe('127.0.0.1');
  });

  it('does not throw when the database write fails', async () => {
    db.execute.mockRejectedValue(new Error('connection lost'));
    await expect(
      auditService.log({ action: 'create', entity: 'employees', details: {} }),
    ).resolves.toBeUndefined();
  });

  it('uses null defaults for optional fields', async () => {
    await auditService.log({ action: 'create', entity: 'library' });
    const values = db.execute.mock.calls[0][1];
    expect(values[0]).toBeNull(); // actor_id
    expect(values[1]).toBeNull(); // actor_employee_id
    expect(values[4]).toBeNull(); // entity_id
    expect(values[5]).toBe('{}'); // details
    expect(values[6]).toBeNull(); // ip
  });
});
