import { Router, Request } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { query } from '../db';

const router = Router();

// Generic database query handler
// GET /api/db/:table?columns=*&column1=eq:value1&column2=in:value2,value3
router.get('/:table', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const { columns = '*' } = req.query;
    const userId = req.user?.id;

    // Whitelist allowed tables for security
    const allowedTables = [
      'classes',
      'class_members',
      'points_transactions',
      'rewards',
      'reward_classes',
      'reward_purchases',
      'campaigns',
      'campaign_classes',
      'campaign_multipliers',
      'campaign_participations',
      'messages',
      'schools',
      'users',
      'user_roles',
      'profiles',
      'default_point_reasons',
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table' });
    }

    // Build WHERE clause from query parameters
    let whereClause = '1=1';
    let orderByClause = '';
    let limitClause = '';
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'columns') continue;
      if (key === 'order_by') {
        const [column, direction] = String(value).split(':');
        orderByClause = ` ORDER BY "${column}" ${direction === 'asc' ? 'ASC' : 'DESC'}`;
        continue;
      }
      if (key === 'limit') {
        limitClause = ` LIMIT ${String(value)}`;
        continue;
      }

      const stringValue = String(value);
      const [operator, ...rest] = stringValue.split(':');
      const operandValue = rest.join(':'); // Rejoin in case value contains colons

      // Special handling for _or filter
      if (key === '_or' && operator === 'or') {
        // Handle or filter like "expires_at.is.null,expires_at.gt.2024-01-01"
        const orConditions = operandValue.split(',').map(condition => {
          const parts = condition.split('.');
          const col = parts[0];
          const op = parts[1];
          const val = parts.slice(2).join('.');
          
          if (op === 'is' && val === 'null') {
            return `"${col}" IS NULL`;
          } else if (op === 'gt') {
            params.push(val);
            return `"${col}" > $${paramIndex++}`;
          } else if (op === 'gte') {
            params.push(val);
            return `"${col}" >= $${paramIndex++}`;
          } else if (op === 'lt') {
            params.push(val);
            return `"${col}" < $${paramIndex++}`;
          } else if (op === 'lte') {
            params.push(val);
            return `"${col}" <= $${paramIndex++}`;
          } else if (op === 'eq') {
            params.push(val);
            return `"${col}" = $${paramIndex++}`;
          }
          return '1=1';
        });
        whereClause += ` AND (${orConditions.join(' OR ')})`;
        continue;
      }

      if (operator === 'eq') {
        whereClause += ` AND "${key}" = $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'neq') {
        whereClause += ` AND "${key}" != $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'in') {
        const values = operandValue.split(',');
        const placeholders = values.map(() => `$${paramIndex++}`).join(',');
        whereClause += ` AND "${key}" IN (${placeholders})`;
        params.push(...values);
      } else if (operator === 'gt') {
        whereClause += ` AND "${key}" > $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'gte') {
        whereClause += ` AND "${key}" >= $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'lt') {
        whereClause += ` AND "${key}" < $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'lte') {
        whereClause += ` AND "${key}" <= $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      } else if (operator === 'is') {
        if (operandValue === 'null') {
          whereClause += ` AND "${key}" IS NULL`;
        } else {
          whereClause += ` AND "${key}" IS NOT NULL`;
        }
      }
    }

    const selectColumns = String(columns);
    const queryStr = `SELECT ${selectColumns} FROM ${table} WHERE ${whereClause}${orderByClause}${limitClause}`;

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to query database' });
  }
});

// POST - Insert
router.post('/:table', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    // Whitelist allowed tables
    const allowedTables = [
      'classes',
      'class_members',
      'points_transactions',
      'rewards',
      'reward_classes',
      'reward_purchases',
      'campaigns',
      'campaign_classes',
      'campaign_multipliers',
      'campaign_participations',
      'messages',
      'schools',
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table' });
    }

    // Handle both single object and array of objects
    const rows = Array.isArray(data) ? data : [data];
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data to insert' });
    }

    // Build multi-row INSERT
    const columns = Object.keys(rows[0]).map(col => `"${col}"`);
    let paramIndex = 1;
    const allValues: unknown[] = [];
    const valueClauses = rows.map(row => {
      const placeholders = Object.values(row).map(() => `$${paramIndex++}`).join(',');
      allValues.push(...Object.values(row));
      return `(${placeholders})`;
    }).join(',');

    const queryStr = `INSERT INTO ${table} (${columns.join(',')}) 
                      VALUES ${valueClauses}
                      RETURNING *`;

    console.log('Insert query:', queryStr, 'Values:', allValues);
    const result = await query(queryStr, allValues);
    
    // Return single object if input was single object, array if input was array
    res.json(Array.isArray(data) ? result.rows : result.rows[0]);
  } catch (error) {
    console.error('Database insert error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to insert data: ${errorMessage}` });
  }
});

// PATCH - Update
router.patch('/:table', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    // Whitelist allowed tables
    const allowedTables = [
      'classes',
      'class_members',
      'points_transactions',
      'rewards',
      'reward_purchases',
      'campaigns',
      'campaign_multipliers',
      'campaign_classes',
      'campaign_participations',
      'messages',
      'profiles',
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table' });
    }

    let whereClause = '1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Parse filters from query string
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'columns') continue;
      
      const stringValue = String(value);
      const [operator, operandValue] = stringValue.split(':');

      if (operator === 'eq') {
        whereClause += ` AND "${key}" = $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      }
    }

    // Add update values
    const updateColumns = Object.keys(data)
      .map((col) => `"${col}" = $${paramIndex++}`)
      .join(',');
    
    if (updateColumns === '') {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(...Object.values(data));

    const queryStr = `UPDATE ${table} SET ${updateColumns} WHERE ${whereClause} RETURNING *`;
    
    console.log('PATCH query:', { queryStr, params, table, query: req.query });
    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// DELETE - Delete
router.delete('/:table', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;

    // Whitelist allowed tables
    const allowedTables = [
      'messages',
      'campaigns',
      'campaign_multipliers',
      'campaign_classes',
      'campaign_participations',
      'rewards',
      'reward_classes',
      'reward_purchases',
      'class_members',
      'points_transactions',
      'user_roles',
      'profiles',
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table' });
    }

    let whereClause = '1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Parse filters from query string
    for (const [key, value] of Object.entries(req.query)) {
      const stringValue = String(value);
      const [operator, operandValue] = stringValue.split(':');

      if (operator === 'eq') {
        whereClause += ` AND "${key}" = $${paramIndex}`;
        params.push(operandValue);
        paramIndex++;
      }
    }

    const queryStr = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

export default router;
