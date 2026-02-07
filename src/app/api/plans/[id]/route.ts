import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/plans/[id]
 * Fetch a single plan by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[GET /api/plans/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/plans/[id]
 * Partial update of a plan.
 * Supports updating any combination of fields, especially:
 *   - elements (JSONB) for auto-save from canvas
 *   - routes (JSONB) for auto-save from canvas
 *   - name, description, eventType, canvasWidth, canvasHeight
 *   - backgroundType, backgroundImageUrl, backgroundOpacity
 *   - isPublic, thumbnail
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {};

    const allowedStringFields = [
      'name',
      'description',
      'eventType',
      'backgroundType',
      'backgroundImageUrl',
      'thumbnail',
    ] as const;

    const allowedNumberFields = [
      'canvasWidth',
      'canvasHeight',
      'backgroundOpacity',
    ] as const;

    const allowedJsonFields = [
      'elements',
      'routes',
    ] as const;

    const allowedBooleanFields = [
      'isPublic',
    ] as const;

    for (const field of allowedStringFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string' && body[field] !== null) {
          return NextResponse.json(
            { error: `${field} must be a string` },
            { status: 400 }
          );
        }
        updateData[field] = body[field];
      }
    }

    for (const field of allowedNumberFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'number') {
          return NextResponse.json(
            { error: `${field} must be a number` },
            { status: 400 }
          );
        }
        updateData[field] = body[field];
      }
    }

    for (const field of allowedJsonFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    for (const field of allowedBooleanFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'boolean') {
          return NextResponse.json(
            { error: `${field} must be a boolean` },
            { status: 400 }
          );
        }
        updateData[field] = body[field];
      }
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = sql`now()`;

    const [plan] = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, id))
      .returning();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error(`[PUT /api/plans/[id]] Error:`, error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[id]
 * Delete a plan by ID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const [deleted] = await db
      .delete(plans)
      .where(eq(plans.id, id))
      .returning({ id: plans.id });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/plans/[id]] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}

/**
 * Validate UUID v4 format.
 */
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
