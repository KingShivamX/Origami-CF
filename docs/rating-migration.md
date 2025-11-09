# Rating Migration Guide

This guide explains how to migrate existing contest ratings to use the new mathematical formula.

## Overview

The new rating system uses a mathematical formula based on:
- **Problem difficulty weighting**: Harder problems contribute more to performance
- **Time efficiency**: Solving problems faster gives better scores  
- **Normalized performance**: Scores are normalized against total possible points
- **Realistic rating changes**: Capped changes prevent extreme swings

## Migration Options

### 1. Web Interface (Recommended for Testing)

Navigate to `/admin/migrate-ratings` in your browser:

1. **Preview Changes**: See what ratings would become before making changes
2. **Run Migration**: Execute the full migration after reviewing preview
3. **View Results**: See detailed results including all rating changes

### 2. Command Line Interface (Recommended for Production)

```bash
# Preview what changes would be made (safe, no database changes)
npm run migrate-ratings preview

# Run the actual migration (WARNING: modifies database)
npm run migrate-ratings run

# Recalculate rating for a specific user
npm run migrate-ratings user <codeforces_handle>
```

### 3. API Endpoints

For programmatic access:

```bash
# Preview migration
curl -X GET http://localhost:3000/api/admin/migrate-ratings

# Run migration
curl -X POST http://localhost:3000/api/admin/migrate-ratings \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'

# Recalculate specific user
curl -X PUT http://localhost:3000/api/admin/migrate-ratings \
  -H "Content-Type: application/json" \
  -d '{"codeforcesHandle": "user123"}'
```

## Migration Process

The migration works chronologically:

1. **Reset all users** to starting rating (1500)
2. **Process contests** in chronological order (oldest first)
3. **Calculate rating changes** using new formula for each contest
4. **Update user ratings** progressively through their contest history
5. **Update ranks and max ratings** based on final calculations

## What Changes

### Before Migration
- Ratings calculated using old performance system
- Inconsistent rating progression
- May not reflect actual skill properly

### After Migration  
- All ratings recalculated using mathematical formula
- Consistent rating progression based on:
  - Problem difficulty weights (800=1, 1200=1.5, 1600=2, etc.)
  - Time efficiency bonuses
  - Normalized performance scores
- Realistic rating changes (-200 to +200 per contest)

## Example Rating Changes

Based on the mathematical formula, typical changes might be:

```
Handle          Old → New     Delta    Contests
─────────────────────────────────────────────
speedsolver     1650 → 1820   +170        15
beginner         800 → 1420   +620         8  
expert          1900 → 1755   -145        22
newcomer        1200 → 1500   +300         3
```

## Safety Measures

### Before Running Migration

1. **Backup your database**:
   ```bash
   mongodump --db your_database_name --out backup_$(date +%Y%m%d)
   ```

2. **Run preview first**:
   ```bash
   npm run migrate-ratings preview
   ```

3. **Test on staging environment** if possible

### During Migration

- Migration shows progress in real-time
- Errors are logged but don't stop the process
- Individual user failures don't affect others
- All changes are atomic per user

### After Migration

- Check migration results carefully
- Verify top users have reasonable ratings
- Test new contest rating calculations
- Monitor user feedback

## Rollback Plan

If migration results are unsatisfactory:

1. **Restore from backup**:
   ```bash
   mongorestore --db your_database_name --drop backup_$(date +%Y%m%d)/your_database_name
   ```

2. **Or recalculate specific users**:
   ```bash
   npm run migrate-ratings user problematic_user
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Ensure database is running
   - Check connection string in `.env`

2. **Out of Memory**
   - Process users in batches for large databases
   - Monitor memory usage during migration

3. **Individual User Errors**
   - Check training data integrity
   - Verify problem ratings exist
   - Look for corrupted contest records

### Getting Help

- Check console output for detailed error messages
- Look at the `errors` array in migration results
- Use individual user recalculation to debug specific cases

## Performance Notes

- Migration processes ~10-50 users per second depending on contest history
- Large databases (1000+ users) may take several minutes
- Memory usage scales with number of contests per user
- No impact on live website during migration

## Technical Details

### Formula Implementation

The core formula in `utils/ratingSystem.ts`:

```typescript
// Performance Score
P = Σ(W_i × timeFactor_i) for solved problems

// Normalized Performance  
P_norm = P / Σ(W_i) for all problems

// Rating Change
ΔR = k × (P_norm - E)

// Final Rating
R_new = max(600, min(3500, R_old + ΔR))
```

Where:
- `W_i` = problem weight based on difficulty
- `timeFactor_i` = 1 / (1 + solveTime/contestDuration)  
- `k` = sensitivity constant (100)
- `E` = expected performance threshold (0.5)

### Database Changes

The migration modifies these fields:
- `User.rating` - Current rating
- `User.rank` - Current rank tier  
- `User.maxRating` - Highest rating achieved
- `User.maxRank` - Highest rank achieved

Training records remain unchanged.
