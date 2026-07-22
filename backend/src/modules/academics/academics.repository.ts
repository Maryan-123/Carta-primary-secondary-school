import { PoolClient } from "pg";
import { query } from "../../config/database";

export const academicsRepository = {
  getSchoolSettings: async () => (await query(`SELECT * FROM school_settings ORDER BY id LIMIT 1`))[0] ?? null,
  async upsertSchoolSettings(client: PoolClient, payload: Record<string, unknown>) {
    const existing = await client.query<{ id: number }>(`SELECT id FROM school_settings ORDER BY id LIMIT 1`);
    if (existing.rows[0]) {
      await client.query(
        `UPDATE school_settings
         SET school_name = COALESCE($2, school_name),
             school_code = COALESCE($3, school_code),
             address = COALESCE($4, address),
             phone = COALESCE($5, phone),
             email = COALESCE($6, email),
             logo_path = COALESCE($7, logo_path),
             principal_name = COALESCE($8, principal_name),
             currency = COALESCE($9, currency),
             timezone = COALESCE($10, timezone),
             academic_year_start_month = COALESCE($11, academic_year_start_month)
         WHERE id = $1`,
        [
          existing.rows[0].id,
          payload.schoolName ?? null,
          payload.schoolCode ?? null,
          payload.address ?? null,
          payload.phone ?? null,
          payload.email ?? null,
          payload.logoPath ?? null,
          payload.principalName ?? null,
          payload.currency ?? null,
          payload.timezone ?? null,
          payload.academicYearStartMonth ?? null
        ]
      );
      return existing.rows[0].id;
    }

    const inserted = await client.query<{ id: number }>(
      `INSERT INTO school_settings (
         school_name, school_code, address, phone, email, logo_path,
         principal_name, currency, timezone, academic_year_start_month
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'USD'), COALESCE($9, 'Africa/Mogadishu'), COALESCE($10, 8))
       RETURNING id`,
      [
        payload.schoolName ?? "School Name",
        payload.schoolCode ?? null,
        payload.address ?? null,
        payload.phone ?? null,
        payload.email ?? null,
        payload.logoPath ?? null,
        payload.principalName ?? null,
        payload.currency ?? null,
        payload.timezone ?? null,
        payload.academicYearStartMonth ?? null
      ]
    );
    return inserted.rows[0].id;
  },
  listAcademicYears: () => query(`SELECT * FROM academic_years ORDER BY start_date DESC`),
  getAcademicYear: async (id: number) => (await query(`SELECT * FROM academic_years WHERE id = $1`, [id]))[0] ?? null,
  listTerms: () =>
    query(
      `SELECT t.*, ay.name AS academic_year_name
       FROM terms t
       JOIN academic_years ay ON ay.id = t.academic_year_id
       ORDER BY t.start_date DESC`
    ),
  getTerm: async (id: number) => (await query(`SELECT * FROM terms WHERE id = $1`, [id]))[0] ?? null,
  listGradeLevels: () => query(`SELECT * FROM grade_levels ORDER BY level_order`),
  getGradeLevel: async (id: number) => (await query(`SELECT * FROM grade_levels WHERE id = $1`, [id]))[0] ?? null,
  listClassrooms: () =>
    query(
      `SELECT c.*, gl.name AS grade_level_name
       FROM classrooms c
       JOIN grade_levels gl ON gl.id = c.grade_level_id
       ORDER BY gl.level_order, c.name, c.section_name`
    ),
  getClassroom: async (id: number) => (await query(`SELECT * FROM classrooms WHERE id = $1`, [id]))[0] ?? null,
  listSubjects: () => query(`SELECT * FROM subjects ORDER BY name`),
  getSubject: async (id: number) => (await query(`SELECT * FROM subjects WHERE id = $1`, [id]))[0] ?? null,
  listClassSubjects: () =>
    query(
      `SELECT cs.*, s.name AS subject_name, c.name AS classroom_name, ay.name AS academic_year_name
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       JOIN classrooms c ON c.id = cs.classroom_id
       JOIN academic_years ay ON ay.id = cs.academic_year_id
       ORDER BY cs.created_at DESC`
    ),
  getCurrentAcademicYear: async () =>
    (await query(`SELECT * FROM academic_years WHERE is_current = TRUE LIMIT 1`))[0] ?? null,
  getCurrentTerm: async () => (await query(`SELECT * FROM terms WHERE is_current = TRUE LIMIT 1`))[0] ?? null
};
