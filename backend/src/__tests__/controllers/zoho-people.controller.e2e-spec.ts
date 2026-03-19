import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoPeopleController } from '../../zoho-people/zoho-people.controller';

describe('ZohoPeopleController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoPeopleController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoPeopleController>(ZohoPeopleController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Employees ---
  it('GET /zoho-people/employees → listEmployees()', async () => {
    const result = await controller.listEmployees({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-people/employees/:id → getEmployee()', async () => {
    const result = await controller.getEmployee('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/employees → addEmployee()', async () => {
    const result = await controller.addEmployee({ firstName: 'Test', lastName: 'User', emailID: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/employees/:id → updateEmployee()', async () => {
    const result = await controller.updateEmployee('000000000000001', { firstName: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-people/employees/:id → deleteEmployee()', async () => {
    const result = await controller.deleteEmployee('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Departments ---
  it('GET /zoho-people/departments → listDepartments()', async () => {
    const result = await controller.listDepartments();
    expect(result).toBeDefined();
  });

  // --- Leave ---
  it('GET /zoho-people/leave-types → listLeaveTypes()', async () => {
    const result = await controller.listLeaveTypes();
    expect(result).toBeDefined();
  });

  it('GET /zoho-people/leave-requests → listLeaveRequests()', async () => {
    const result = await controller.listLeaveRequests({});
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/leave-requests → addLeaveRequest()', async () => {
    const result = await controller.addLeaveRequest({ Leavetype: 'Casual Leave', From: '2026-01-01', To: '2026-01-02', Employee_ID: '1' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/leave-requests/:id/approve → approveLeave()', async () => {
    const result = await controller.approveLeave('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/leave-requests/:id/reject → rejectLeave()', async () => {
    const result = await controller.rejectLeave('000000000000001', { reason: 'Test rejection' });
    expect(result).toBeDefined();
  });

  // --- Attendance ---
  it('GET /zoho-people/attendance/:empId → listAttendance()', async () => {
    const result = await controller.listAttendance('000000000000001', '2026-01-01', '2026-01-31');
    expect(result).toBeDefined();
  });

  // --- Forms ---
  it('GET /zoho-people/forms/:formName/records → getFormRecords()', async () => {
    const result = await controller.getFormRecords('P_EmployeeView', {});
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/forms/:formName/records → addFormRecord()', async () => {
    const result = await controller.addFormRecord('P_EmployeeView', { field1: 'value1' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-people/forms/:formName/records/:id → updateFormRecord()', async () => {
    const result = await controller.updateFormRecord('P_EmployeeView', '000000000000001', { field1: 'updated' });
    expect(result).toBeDefined();
  });
});
