# Upseller Dashboard Implementation

## Overview
The Upseller Dashboard is a new module that provides upseller employees and project managers with a comprehensive view of their performance metrics, similar to the Front Seller Dashboard. It tracks targets, achievements, and team performance in real-time.

## Features

### 1. Performance Tracking
- **Current Month Performance**: Shows target vs. achieved accounts, gross value, and cash-in
- **Previous Performance**: Historical data for the last 6 months
- **Team Performance**: Comparison with other team members
- **Personal Ranking**: Individual performance ranking within the team

### 2. Target Management
- Set monthly targets for accounts, gross value, and cash-in
- Real-time target updates
- Progress tracking with completion percentages

### 3. Real-time Updates
- Automatic refresh every 30 seconds
- Real-time subscriptions to performance data changes
- Automatic updates when sales dispositions change

## Database Schema

### Tables Created

#### `upseller_targets`
- Stores monthly targets for each upseller
- Fields: seller_id, month, target_accounts, target_gross, target_cash_in

#### `upseller_performance`
- Stores actual performance data for each upseller
- Fields: seller_id, month, accounts_achieved, total_gross, total_cash_in, total_remaining

### Functions Created

#### `update_upseller_performance()`
- Trigger function that automatically updates performance when sales dispositions change
- Only processes upseller department employees

#### `get_upseller_team_performance_summary()`
- Returns team performance summary with rankings
- Used for team comparison and personal ranking

#### `recalculate_upseller_performance()`
- Manually recalculates performance for a specific user and month
- Useful for data corrections or historical calculations

## Setup Instructions

### 1. Database Migration
Run the SQL migration file to create the required tables and functions:

```bash
# Apply the migration to your Supabase database
psql -h your-host -U your-user -d your-database -f upseller-performance-schema.sql
```

### 2. Frontend Components
The following components have been created:

- **Types**: `src/types/upseller.ts` - TypeScript interfaces
- **Hook**: `src/hooks/useUpsellerPerformance.ts` - Data fetching and management
- **Component**: `src/pages/dashboard/UpsellerDashboard.tsx` - Main dashboard UI
- **Route**: Added to `src/App.tsx` at `/upseller-dashboard`

### 3. Navigation Updates
The navigation menu has been updated to:
- Show "My Dashboard" for upseller users
- Redirect upseller users to `/upseller-dashboard`
- Handle role-based routing and access control

## Usage

### For Upseller Employees
1. **Access Dashboard**: Navigate to `/upseller-dashboard` or click "My Dashboard" in navigation
2. **Set Targets**: Click "Set Targets" button to configure monthly goals
3. **Monitor Performance**: View current month progress and historical data
4. **Team Comparison**: See how you rank against other team members

### For Administrators
1. **View All Data**: Access to all upseller performance data
2. **Monitor Team**: Track overall team performance and trends
3. **Data Management**: Can manually recalculate performance if needed

## Technical Implementation

### Authentication & Permissions
- Uses existing authentication system
- Role-based access control (upseller role required)
- Row-level security policies for data protection

### Data Flow
1. **Sales Disposition Changes** → Trigger → Update Performance
2. **Target Updates** → Database → Dashboard Refresh
3. **Real-time Subscriptions** → Automatic UI Updates

### Performance Optimization
- Database indexes on frequently queried fields
- Efficient SQL queries with proper joins
- Real-time subscriptions for immediate updates

## API Endpoints

### Required Backend API
The dashboard requires the following API endpoint:

```javascript
POST /api/admin/check-user-role
{
  "userId": "user-uuid",
  "roleName": "upseller"
}
```

Response:
```javascript
{
  "hasRole": true/false
}
```

## Configuration

### Environment Variables
No additional environment variables are required. The dashboard uses existing Supabase configuration.

### Database Permissions
The migration script automatically sets up:
- Row-level security policies
- Function execution permissions
- Indexes for performance optimization

## Testing

### Manual Testing
1. **Create Test User**: Create a user with upseller role
2. **Set Targets**: Configure monthly targets
3. **Create Sales**: Add sales dispositions to see performance updates
4. **Verify Dashboard**: Check that data appears correctly

### Automated Testing
The system includes:
- Error handling for missing data
- Loading states and skeleton screens
- Toast notifications for user feedback

## Troubleshooting

### Common Issues

#### Dashboard Not Loading
- Check user has upseller role
- Verify database tables exist
- Check browser console for errors

#### Performance Not Updating
- Verify trigger function is active
- Check sales_dispositions table for data
- Run manual recalculation if needed

#### Permission Errors
- Ensure user has proper role assignment
- Check RLS policies are active
- Verify API endpoint is accessible

### Debug Commands
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%upseller%';

-- Check trigger status
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%upseller%';

-- Test performance function
SELECT get_upseller_team_performance_summary('2024-01-01');

-- Manual performance recalculation
SELECT recalculate_upseller_performance('user-uuid', '2024-01-01');
```

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Trend analysis and forecasting
2. **Export Functionality**: PDF/Excel reports
3. **Mobile Optimization**: Responsive design improvements
4. **Integration**: Connect with other CRM modules

### Performance Improvements
1. **Caching**: Implement Redis caching for frequently accessed data
2. **Pagination**: Handle large datasets more efficiently
3. **Lazy Loading**: Load dashboard sections on demand

## Support

For technical support or questions about the Upseller Dashboard:
1. Check the troubleshooting section above
2. Review database logs for errors
3. Verify all components are properly imported
4. Ensure database migration completed successfully

## Changelog

### Version 1.0.0 (Initial Release)
- Basic dashboard functionality
- Performance tracking and target management
- Team comparison features
- Real-time updates
- Role-based access control
