import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/schema';
import { desc, asc, sql, count } from 'drizzle-orm';

// TODO: Replace with actual authenticated user ID once auth is implemented
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * GET /api/plans
 * List plans with pagination and sorting.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - sort: 'updatedAt' | 'createdAt' | 'name' (default 'updatedAt')
 *   - order: 'asc' | 'desc' (default 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const sort = searchParams.get('sort') || 'updatedAt';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;

    // Determine sort column
    const sortColumnMap: Record<string, typeof plans.updatedAt | typeof plans.createdAt | typeof plans.name> = {
      updatedAt: plans.updatedAt,
      createdAt: plans.createdAt,
      name: plans.name,
    };
    const sortColumn = sortColumnMap[sort] || plans.updatedAt;
    const orderFn = order === 'asc' ? asc : desc;

    // TODO: Filter by authenticated user ID once auth is implemented
    // For now, return all plans (MVP)

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const [planRows, totalResult] = await Promise.all([
      db
        .select()
        .from(plans)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(plans),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return NextResponse.json({
      plans: planRows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/plans] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans
 * Create a new plan.
 *
 * Body:
 *   - name: string (required)
 *   - eventType?: string
 *   - canvasWidth?: number
 *   - canvasHeight?: number
 *   - backgroundType?: string
 *   - elements?: unknown[]
 *   - routes?: unknown[]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      eventType,
      canvasWidth,
      canvasHeight,
      backgroundType,
      elements,
      routes,
    } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    if (canvasWidth !== undefined && (typeof canvasWidth !== 'number' || canvasWidth <= 0)) {
      return NextResponse.json(
        { error: 'canvasWidth must be a positive number' },
        { status: 400 }
      );
    }

    if (canvasHeight !== undefined && (typeof canvasHeight !== 'number' || canvasHeight <= 0)) {
      return NextResponse.json(
        { error: 'canvasHeight must be a positive number' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const insertData: typeof plans.$inferInsert = {
      // TODO: Replace with actual authenticated user ID once auth is implemented
      userId: PLACEHOLDER_USER_ID,
      name: name.trim(),
      eventType: eventType ?? 'hyrox',
      canvasWidth: canvasWidth ?? 1200,
      canvasHeight: canvasHeight ?? 800,
      backgroundType: backgroundType ?? 'grid',
      elements: elements ?? [],
      routes: routes ?? [],
    };

    const [plan] = await db.insert(plans).values(insertData).returning();

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/plans] Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
