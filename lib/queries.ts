import { dbQuery, dbQueryOne } from "./db";

// ─── Org & User ────────────────────────────────────────────────────────────

export async function getOrgByEmail(email: string) {
  return dbQueryOne<{
    org_id: string; org_name: string; org_slug: string; plan: string;
    trial_ends_at: string | null; user_id: string; user_name: string;
    user_email: string; user_role: string; user_image: string | null;
    farm_name: string | null; location: string | null;
    operation_type: string | null; farm_size: number | null;
    animal_count: number | null;
  }>(
    `SELECT
       o.id            AS org_id,
       o.name          AS org_name,
       o.slug          AS org_slug,
       o.plan,
       o.trial_ends_at,
       u.id            AS user_id,
       u.name          AS user_name,
       u.email         AS user_email,
       u.role          AS user_role,
       u.image         AS user_image,
       u.farm_name,
       u.location,
       u.operation_type,
       u.farm_size,
       u.animal_count
     FROM users u
     LEFT JOIN organizations o ON o.id = u.organization_id
     WHERE u.email = $1`,
    [email]
  );
}

export async function getUserByEmail(email: string) {
  return dbQueryOne<{
    id: string; name: string; email: string; role: string;
    organization_id: string | null; image: string | null;
    farm_name: string | null; location: string | null;
    operation_type: string | null; farm_size: number | null;
    animal_count: number | null; plan: string | null;
  }>(
    `SELECT id, name, email, role, organization_id, image,
            farm_name, location, operation_type, farm_size, animal_count, plan
     FROM users WHERE email = $1`,
    [email]
  );
}

export async function getUserOrganizations(userId: string) {
  return dbQuery<{
    id: string; name: string; slug: string; role: string;
  }>(
    `SELECT o.id, o.name, o.slug, om.role
     FROM organization_members om
     JOIN organizations o ON o.id = om.organization_id
     WHERE om.user_id = $1
     ORDER BY o.created_at ASC`,
    [userId]
  );
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export async function getDashboardStats(orgId: string) {
  const [fields, animals, mobs, finance] = await Promise.all([
    dbQueryOne<{ total_fields: string; active_seasons: string }>(
      `SELECT
         COUNT(DISTINCT f.id)::text                                      AS total_fields,
         COUNT(DISTINCT s.id) FILTER (WHERE s.status='active')::text     AS active_seasons
       FROM fields f
       LEFT JOIN seasons s ON s.field_id = f.id
       WHERE f.organization_id = $1`,
      [orgId]
    ),
    dbQueryOne<{ total_animals: string }>(
      `SELECT COUNT(*)::text AS total_animals
       FROM animals WHERE organization_id = $1 AND status = 'active'`,
      [orgId]
    ),
    dbQueryOne<{ active_mobs: string }>(
      `SELECT COUNT(*)::text AS active_mobs FROM mobs WHERE organization_id = $1`,
      [orgId]
    ),
    dbQueryOne<{ monthly_revenue: string; monthly_expenses: string }>(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type='income'),0)::text   AS monthly_revenue,
         COALESCE(SUM(amount) FILTER (WHERE type='expense'),0)::text  AS monthly_expenses
       FROM financial_entries
       WHERE organization_id = $1
         AND entry_date >= date_trunc('month', now())`,
      [orgId]
    ),
  ]);

  return {
    totalFields:      parseInt(fields?.total_fields      ?? "0"),
    activeSeasons:    parseInt(fields?.active_seasons    ?? "0"),
    totalAnimals:     parseInt(animals?.total_animals    ?? "0"),
    activeMobs:       parseInt(mobs?.active_mobs         ?? "0"),
    monthlyRevenue:   parseFloat(finance?.monthly_revenue  ?? "0"),
    monthlyExpenses:  parseFloat(finance?.monthly_expenses ?? "0"),
  };
}

// Last 7 months revenue + expenses per month
export async function getRevenueChart(orgId: string) {
  return dbQuery<{ month: string; revenue: number; expenses: number }>(
    `SELECT
       TO_CHAR(gs, 'Mon') AS month,
       COALESCE(SUM(fe.amount) FILTER (WHERE fe.type='income'),0)  AS revenue,
       COALESCE(SUM(fe.amount) FILTER (WHERE fe.type='expense'),0) AS expenses
     FROM generate_series(
       date_trunc('month', now()) - interval '6 months',
       date_trunc('month', now()),
       '1 month'
     ) AS gs
     LEFT JOIN financial_entries fe
       ON date_trunc('month', fe.entry_date) = gs
      AND fe.organization_id = $1
     GROUP BY gs
     ORDER BY gs`,
    [orgId]
  );
}

// Livestock breakdown by species
export async function getLivestockBySpecies(orgId: string) {
  return dbQuery<{ species: string; count: number }>(
    `SELECT species, SUM(headcount)::int AS count
     FROM mobs WHERE organization_id = $1
     GROUP BY species ORDER BY count DESC`,
    [orgId]
  );
}

// ─── Fields ────────────────────────────────────────────────────────────────

export async function getFields(orgId: string) {
  return dbQuery<{
    id: string; name: string; area_ha: number; soil_type: string | null;
    created_at: string; boundary_geojson: unknown | null;
    crop_type: string | null; season_status: string | null;
  }>(
    `SELECT
       f.id, f.name, f.area_ha, f.soil_type, f.created_at,
       f.boundary_geojson,
       s.crop_type, s.status AS season_status
     FROM fields f
     LEFT JOIN LATERAL (
       SELECT crop_type, status FROM seasons
       WHERE field_id = f.id
       ORDER BY planted_at DESC LIMIT 1
     ) s ON true
     WHERE f.organization_id = $1
     ORDER BY f.created_at DESC`,
    [orgId]
  );
}

export async function createField(
  orgId: string,
  data: { name: string; area_ha: number; soil_type?: string }
) {
  return dbQueryOne<{ id: string }>(
    `INSERT INTO fields (organization_id, name, area_ha, soil_type)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [orgId, data.name, data.area_ha, data.soil_type ?? null]
  );
}

export async function bulkCreateFields(
  orgId: string,
  fields: { name: string; area_ha: number; boundary_geojson?: any }[]
) {
  if (fields.length === 0) return [];
  const values: any[] = [];
  const placeholders: string[] = [];
  
  let i = 1;
  fields.forEach(f => {
    placeholders.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
    values.push(orgId, f.name, f.area_ha, f.boundary_geojson ? JSON.stringify(f.boundary_geojson) : null);
  });

  return dbQuery<{ id: string }>(
    `INSERT INTO fields (organization_id, name, area_ha, boundary_geojson)
     VALUES ${placeholders.join(', ')} RETURNING id`,
    values
  );
}

export async function deleteField(orgId: string, id: string) {
  return dbQuery(
    `DELETE FROM fields WHERE organization_id = $1 AND id = $2`,
    [orgId, id]
  );
}

// ─── Seasons ───────────────────────────────────────────────────────────────

export async function getSeasons(orgId: string) {
  return dbQuery<{
    id: string; field_id: string; field_name: string; crop_type: string;
    planted_at: string; harvested_at: string | null;
    yield_kg: number | null; status: string;
  }>(
    `SELECT s.id, s.field_id, f.name AS field_name, s.crop_type,
            s.planted_at, s.harvested_at, s.yield_kg, s.status
     FROM seasons s
     JOIN fields f ON f.id = s.field_id
     WHERE f.organization_id = $1
     ORDER BY s.planted_at DESC`,
    [orgId]
  );
}

export async function createSeason(
  orgId: string,
  data: { field_id: string; crop_type: string; planted_at: string; status?: string }
) {
  // Verify field belongs to org
  const field = await dbQueryOne<{ id: string }>(
    `SELECT id FROM fields WHERE id = $1 AND organization_id = $2`,
    [data.field_id, orgId]
  );
  if (!field) throw new Error("Field not found");

  return dbQueryOne<{ id: string }>(
    `INSERT INTO seasons (field_id, crop_type, planted_at, status)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [data.field_id, data.crop_type, data.planted_at, data.status ?? "planning"]
  );
}

// ─── Spray Records ─────────────────────────────────────────────────────────

export async function getSprayRecords(orgId: string) {
  return dbQuery<{
    id: string; field_id: string; field_name: string; product: string;
    rate: number; unit: string; applied_at: string; withhold_days: number;
    operator_name: string | null; notes: string | null;
    area_ha: number;
  }>(
    `SELECT
       sr.id, sr.field_id, f.name AS field_name, sr.product,
       sr.rate, sr.unit, sr.applied_at, sr.withhold_days,
       u.name AS operator_name, sr.notes, f.area_ha
     FROM spray_records sr
     JOIN fields f ON f.id = sr.field_id
     LEFT JOIN users u ON u.id = sr.operator_id
     WHERE f.organization_id = $1
     ORDER BY sr.applied_at DESC`,
    [orgId]
  );
}

export async function createSprayRecord(
  orgId: string,
  operatorId: string,
  data: {
    field_id: string; product: string; rate: number; unit: string;
    applied_at: string; withhold_days: number; notes?: string;
  }
) {
  const field = await dbQueryOne<{ id: string }>(
    `SELECT id FROM fields WHERE id = $1 AND organization_id = $2`,
    [data.field_id, orgId]
  );
  if (!field) throw new Error("Field not found");

  return dbQueryOne<{ id: string }>(
    `INSERT INTO spray_records (field_id, product, rate, unit, applied_at, withhold_days, operator_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [data.field_id, data.product, data.rate, data.unit,
     data.applied_at, data.withhold_days, operatorId, data.notes ?? null]
  );
}

// ─── Mobs ──────────────────────────────────────────────────────────────────

export async function getMobs(orgId: string) {
  return dbQuery<{
    id: string; name: string; species: string; headcount: number;
    paddock_id: string | null; paddock_name: string | null;
  }>(
    `SELECT m.id, m.name, m.species, m.headcount,
            m.paddock_id, p.name AS paddock_name
     FROM mobs m
     LEFT JOIN paddocks p ON p.id = m.paddock_id
     WHERE m.organization_id = $1
     ORDER BY m.species, m.name`,
    [orgId]
  );
}

export async function createMob(
  orgId: string,
  data: { name: string; species: string; headcount: number; paddock_id?: string }
) {
  return dbQueryOne<{ id: string }>(
    `INSERT INTO mobs (organization_id, name, species, headcount, paddock_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [orgId, data.name, data.species, data.headcount, data.paddock_id ?? null]
  );
}

// ─── Animals ───────────────────────────────────────────────────────────────

export async function getAnimals(
  orgId: string,
  filters: { species?: string; status?: string; search?: string } = {}
) {
  let sql = `
    SELECT a.id, a.nlis_tag, a.rfid_tag, a.visual_tag, a.species,
           a.breed, a.sex, a.dob, a.status,
           m.name AS mob_name, m.id AS mob_id
    FROM animals a
    LEFT JOIN mobs m ON m.id = a.mob_id
    WHERE a.organization_id = $1
  `;
  const params: unknown[] = [orgId];
  let idx = 2;

  if (filters.species) { sql += ` AND a.species = $${idx++}`; params.push(filters.species); }
  if (filters.status)  { sql += ` AND a.status = $${idx++}`;  params.push(filters.status);  }
  if (filters.search) {
    sql += ` AND (a.nlis_tag ILIKE $${idx} OR a.breed ILIKE $${idx} OR a.visual_tag ILIKE $${idx})`;
    params.push(`%${filters.search}%`); idx++;
  }
  sql += " ORDER BY a.species, a.dob DESC NULLS LAST LIMIT 200";

  return dbQuery<{
    id: string; nlis_tag: string | null; rfid_tag: string | null;
    visual_tag: string | null; species: string; breed: string | null;
    sex: string; dob: string | null; status: string;
    mob_name: string | null; mob_id: string | null;
  }>(sql, params);
}

export async function getAnimalCounts(orgId: string) {
  return dbQuery<{ species: string; count: number }>(
    `SELECT species, COUNT(*)::int AS count
     FROM animals WHERE organization_id = $1 AND status='active'
     GROUP BY species`,
    [orgId]
  );
}

export async function createAnimal(
  orgId: string,
  data: {
    nlis_tag?: string; rfid_tag?: string; visual_tag?: string;
    species: string; breed?: string; sex: string; dob?: string;
    mob_id?: string;
  }
) {
  return dbQueryOne<{ id: string }>(
    `INSERT INTO animals
       (organization_id, nlis_tag, rfid_tag, visual_tag, species, breed, sex, dob, mob_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [orgId, data.nlis_tag ?? null, data.rfid_tag ?? null, data.visual_tag ?? null,
     data.species, data.breed ?? null, data.sex, data.dob ?? null, data.mob_id ?? null]
  );
}

// ─── Health Events ─────────────────────────────────────────────────────────

export async function getHealthEvents(orgId: string) {
  return dbQuery<{
    id: string; animal_id: string | null; mob_id: string | null;
    event_type: string; product: string | null; dose: number | null;
    dose_unit: string | null; treatment_date: string;
    withhold_date: string | null; notes: string | null;
    mob_name: string | null; animal_tag: string | null;
  }>(
    `SELECT
       he.id, he.animal_id, he.mob_id, he.event_type,
       he.product, he.dose, he.dose_unit,
       he.treatment_date, he.withhold_date, he.notes,
       m.name  AS mob_name,
       a.nlis_tag AS animal_tag
     FROM health_events he
     LEFT JOIN mobs    m ON m.id = he.mob_id
     LEFT JOIN animals a ON a.id = he.animal_id
     WHERE (m.organization_id = $1 OR a.organization_id = $1)
     ORDER BY he.treatment_date DESC`,
    [orgId]
  );
}

export async function createHealthEvent(
  orgId: string,
  data: {
    animal_id?: string; mob_id?: string; event_type: string;
    product?: string; dose?: number; dose_unit?: string;
    treatment_date: string; withhold_date?: string; notes?: string;
  }
) {
  return dbQueryOne<{ id: string }>(
    `INSERT INTO health_events
       (animal_id, mob_id, event_type, product, dose, dose_unit,
        treatment_date, withhold_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [data.animal_id ?? null, data.mob_id ?? null, data.event_type,
     data.product ?? null, data.dose ?? null, data.dose_unit ?? null,
     data.treatment_date, data.withhold_date ?? null, data.notes ?? null]
  );
}

// ─── Finance ───────────────────────────────────────────────────────────────

export async function getFinancialEntries(
  orgId: string,
  limit = 50
) {
  return dbQuery<{
    id: string; category: string; type: string; amount: number;
    entry_date: string; description: string | null;
  }>(
    `SELECT id, category, type, amount::float AS amount, entry_date, description
     FROM financial_entries
     WHERE organization_id = $1
     ORDER BY entry_date DESC
     LIMIT $2`,
    [orgId, limit]
  );
}

export async function createFinancialEntry(
  orgId: string,
  data: {
    category: string; type: string; amount: number;
    entry_date: string; description?: string;
  }
) {
  return dbQueryOne<{ id: string }>(
    `INSERT INTO financial_entries
       (organization_id, category, type, amount, entry_date, description)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [orgId, data.category, data.type, data.amount,
     data.entry_date, data.description ?? null]
  );
}

// ─── Org / Settings ────────────────────────────────────────────────────────

export async function getOrgById(orgId: string) {
  return dbQueryOne<{
    id: string; name: string; slug: string; plan: string;
    trial_ends_at: string | null; stripe_customer_id: string | null;
    created_at: string;
  }>(
    `SELECT id, name, slug, plan, trial_ends_at, stripe_customer_id, created_at
     FROM organizations WHERE id = $1`,
    [orgId]
  );
}

export async function updateOrg(
  orgId: string,
  data: { name?: string; slug?: string }
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  if (data.name) { sets.push(`name = $${idx++}`); params.push(data.name); }
  if (data.slug) { sets.push(`slug = $${idx++}`); params.push(data.slug); }
  if (!sets.length) return;
  params.push(orgId);
  await dbQuery(`UPDATE organizations SET ${sets.join(", ")} WHERE id = $${idx}`, params);
}

export async function getTeamMembers(orgId: string) {
  return dbQuery<{
    id: string; name: string; email: string; role: string; image: string | null;
  }>(
    `SELECT id, name, email, role, image
     FROM users WHERE organization_id = $1 ORDER BY role, name`,
    [orgId]
  );
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; location?: string; operation_type?: string }
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  if (data.name)           { sets.push(`name = $${idx++}`);           params.push(data.name); }
  if (data.location)       { sets.push(`location = $${idx++}`);       params.push(data.location); }
  if (data.operation_type) { sets.push(`operation_type = $${idx++}`); params.push(data.operation_type); }
  if (!sets.length) return;
  params.push(userId);
  await dbQuery(`UPDATE users SET ${sets.join(", ")} WHERE id = $${idx}`, params);
}

// ─── Paddocks ──────────────────────────────────────────────────────────────

export async function getPaddocks(orgId: string) {
  return dbQuery<{ id: string; name: string; area_ha: number | null }>(
    `SELECT id, name, area_ha FROM paddocks WHERE organization_id = $1 ORDER BY name`,
    [orgId]
  );
}
