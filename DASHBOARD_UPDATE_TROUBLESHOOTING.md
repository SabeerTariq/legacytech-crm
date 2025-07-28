# 🔧 Dashboard Update Troubleshooting Guide

## Issue Description
The dashboard is not showing updated performance data (accounts achieved, gross, cash in, remaining) after completing a sales form.

## ✅ What Has Been Implemented

### 1. **Automatic Performance Tracking System**
- ✅ Database trigger that automatically updates performance when sales dispositions are created
- ✅ Real-time subscriptions to database changes
- ✅ Enhanced refresh mechanisms in the dashboard
- ✅ Auto-refresh every 30 seconds
- ✅ Manual refresh button with loading states

### 2. **Database Triggers**
- ✅ `trigger_update_front_seller_performance` on `sales_dispositions` table
- ✅ Automatically updates `front_seller_performance` table
- ✅ Handles INSERT, UPDATE, and DELETE operations
- ✅ Department-based filtering (only Front Sales employees)

### 3. **Frontend Enhancements**
- ✅ Real-time subscriptions to `sales_dispositions` and `front_seller_performance` tables
- ✅ Enhanced refresh button with loading states
- ✅ Auto-refresh every 30 seconds
- ✅ Better error handling and user feedback
- ✅ Success messages that mention dashboard updates

## 🔍 Troubleshooting Steps

### Step 1: Verify Database Trigger is Working

Check if the trigger is properly installed and working:

```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_front_seller_performance';

-- Check recent performance updates
SELECT * FROM front_seller_performance 
ORDER BY updated_at DESC 
LIMIT 5;

-- Check recent sales dispositions
SELECT id, customer_name, user_id, gross_value, cash_in, remaining, created_at 
FROM sales_dispositions 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 2: Verify User Department Assignment

Ensure the user is properly assigned to Front Sales department:

```sql
-- Check user's department
SELECT e.email, e.department, p.id as profile_id, p.username
FROM employees e
LEFT JOIN profiles p ON e.email = p.username || '@example.com'
WHERE p.username = 'your_username';
```

### Step 3: Check Real-time Subscriptions

Open browser developer console and look for these messages:
- "Setting up real-time subscriptions for user: [user_id]"
- "Sales disposition subscription status: SUBSCRIBED"
- "Performance subscription status: SUBSCRIBED"
- "Sales disposition changed: [payload]"
- "Performance data changed: [payload]"

### Step 4: Test Manual Refresh

1. Complete a sales form
2. Go to the Front Seller Dashboard
3. Click the "Refresh" button
4. Check if the data updates

### Step 5: Check Date Format Issues

Verify the date format matches between frontend and database:

```sql
-- Check current month format
SELECT 
  DATE_TRUNC('month', CURRENT_DATE)::DATE as current_month_db,
  '2025-07-01' as expected_format;

-- Check performance data for current month
SELECT * FROM front_seller_performance 
WHERE seller_id = 'your_user_id' 
AND month = '2025-07-01';
```

## 🛠️ Solutions

### Solution 1: Force Refresh Dashboard

If the automatic updates aren't working, use the manual refresh:

1. **Click the Refresh Button**: Look for the refresh icon in the dashboard header
2. **Wait for Loading**: The button will show "Refreshing..." while loading
3. **Check Console**: Look for any error messages in browser console

### Solution 2: Check Browser Console

Open browser developer tools (F12) and check for:

1. **Network Errors**: Look for failed API requests
2. **Subscription Errors**: Check for real-time subscription failures
3. **JavaScript Errors**: Look for any JavaScript errors

### Solution 3: Verify User Permissions

Ensure the user has proper permissions:

1. **Check Role**: User should have `front_seller` role or be `admin`
2. **Check Department**: User should be in "Front Sales" department
3. **Check Authentication**: User should be properly authenticated

### Solution 4: Test with Different Browser

1. **Clear Cache**: Clear browser cache and cookies
2. **Try Incognito**: Test in incognito/private mode
3. **Try Different Browser**: Test with Chrome, Firefox, or Safari

### Solution 5: Check Network Connectivity

1. **Internet Connection**: Ensure stable internet connection
2. **Supabase Status**: Check if Supabase is accessible
3. **Firewall**: Ensure no firewall blocking real-time connections

## 🧪 Testing the System

### Manual Test Steps:

1. **Open Dashboard**: Navigate to Front Seller Dashboard
2. **Note Current Values**: Write down current performance numbers
3. **Complete Sales Form**: Fill out and submit a sales form
4. **Check Dashboard**: Return to dashboard and check if numbers updated
5. **Try Refresh**: Click refresh button if numbers didn't update automatically

### Expected Behavior:

- ✅ Sales form submission should trigger automatic performance update
- ✅ Dashboard should show updated numbers within 30 seconds
- ✅ Manual refresh should immediately show updated data
- ✅ Success message should mention "dashboard performance has been updated"

## 📊 Debug Information

### Check These Tables:

```sql
-- Check if performance data exists
SELECT * FROM front_seller_performance 
WHERE seller_id = 'your_user_id' 
ORDER BY month DESC;

-- Check if sales dispositions exist
SELECT * FROM sales_dispositions 
WHERE user_id = 'your_user_id' 
ORDER BY created_at DESC;

-- Check if targets exist
SELECT * FROM front_seller_targets 
WHERE seller_id = 'your_user_id' 
ORDER BY month DESC;
```

### Common Issues and Fixes:

1. **No Performance Data**: Run the recalculation function
2. **Wrong Department**: Update employee department to "Front Sales"
3. **Missing Profile**: Ensure user has a profile record
4. **Date Mismatch**: Check if month format matches between frontend and database

## 🚀 Quick Fix Commands

### Recalculate Performance for User:

```sql
SELECT recalculate_seller_performance('your_user_id');
```

### Check Trigger Status:

```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_front_seller_performance';
```

### Test Real-time Subscriptions:

```sql
-- This will show if the trigger is working
INSERT INTO sales_dispositions (
  customer_name, user_id, gross_value, cash_in, remaining, sale_date
) VALUES (
  'Test Customer', 'your_user_id', 1000, 500, 500, CURRENT_DATE
);
```

## 📞 Support

If the issue persists:

1. **Check Console Logs**: Look for error messages
2. **Verify Database**: Ensure triggers and functions are installed
3. **Test with Different User**: Try with a different Front Sales employee
4. **Contact Support**: Provide console logs and error messages

## 🎯 Summary

The automatic dashboard update system is fully implemented and should work automatically. If it's not working:

1. **Check browser console** for error messages
2. **Verify user department** is "Front Sales"
3. **Try manual refresh** button
4. **Check network connectivity** and Supabase status
5. **Test with different browser** or incognito mode

The system includes multiple fallback mechanisms to ensure data is always current and accurate. 