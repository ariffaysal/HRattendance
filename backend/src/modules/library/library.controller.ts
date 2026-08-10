import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // Policies
  @Get('policies')
  async getAllPolicies(@Query('search') search?: string) {
    return this.libraryService.getAllPolicies(search);
  }

  @Get('policies/active-with-rules')
  async getActivePoliciesWithRules() {
    return this.libraryService.getActivePoliciesWithRules();
  }

  @Get('policies/:id')
  async getPolicyById(@Param('id') id: string) {
    return this.libraryService.getPolicyById(parseInt(id));
  }

  @Post('policies')
  async createPolicy(@Body() data: any) {
    return this.libraryService.createPolicy(data);
  }

  @Put('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() data: any) {
    return this.libraryService.updatePolicy(parseInt(id), data);
  }

  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string) {
    return this.libraryService.deletePolicy(parseInt(id));
  }

  // Policy Rules
  @Get('policies/:policyId/rules')
  async getRulesByPolicy(@Param('policyId') policyId: string) {
    return this.libraryService.getRulesByPolicy(parseInt(policyId));
  }

  @Post('policies/:policyId/rules')
  async createRule(
    @Param('policyId') policyId: string,
    @Body() data: any,
  ) {
    return this.libraryService.createRule(parseInt(policyId), data);
  }

  @Put('rules/:ruleId')
  async updateRule(
    @Param('ruleId') ruleId: string,
    @Body() data: any,
  ) {
    return this.libraryService.updateRule(parseInt(ruleId), data);
  }

  @Delete('rules/:ruleId')
  async deleteRule(@Param('ruleId') ruleId: string) {
    return this.libraryService.deleteRule(parseInt(ruleId));
  }
}
