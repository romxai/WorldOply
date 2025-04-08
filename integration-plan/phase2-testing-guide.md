# Phase 2 Testing Guide

This document outlines how to test the Phase 2 implementation of the auction system integration.

## Prerequisites

1. Ensure the development server is running:
   ```
   npm run dev
   ```

2. Ensure the backend API server is running:
   ```
   cd DC\ World\ Building/
   npm run dev
   ```

3. Make sure you have sample auction data in your database.

## Testing Areas

### 1. Auction Component

#### Loading States
- Navigate to the Auction component in the UI
- Temporarily slow down your network (using browser DevTools) to observe loading states
- Verify the loading spinner appears while data is being fetched
- Confirm the UI recovers gracefully once data is loaded

#### Empty State
- If possible, clear auction data temporarily to test empty state
- Verify the "No active auctions found" message displays correctly

#### Error Handling
- Temporarily disable network connection while loading auctions
- Verify error message appears
- Test that the "Try Again" button works correctly
- Confirm the error state is cleared when connection is restored

### 2. AuctionTimer Component

- View auctions with different end times
- Verify the timer displays correctly in format: "XXh XXm XXs" or "XXm XXs"
- Create a test auction with end time less than 5 minutes from now
- Verify that the timer turns red and starts pulsing for ending auctions
- Test that when an auction ends, it is removed from the list
- Verify the `onEnd` callback works correctly when an auction ends

### 3. Bidding Functionality

- Select an auction to bid on
- Verify the detailed auction view displays correctly
- Test the bid amount controls (+ and - buttons)
- Verify minimum bid validation works (cannot place bid lower than current + increment)
- Test placing a bid and verify success notification appears
- Test placing an invalid bid and verify error notification appears

### 4. Notification System

- Test each notification type using the following mock code in browser console:

```javascript
// Access notification service (manually find in React DevTools first to confirm path)
const notificationService = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?._debugOwner?.memoizedProps?.value?.notificationService;

// Test different notification types
if (notificationService) {
  notificationService.showNotification("Test notification", "info");
  notificationService.showBidPlaced(1000, "Test Auction");
  notificationService.showOutbid("Test Auction");
  notificationService.showAuctionWon("Test Auction");
  notificationService.showAuctionLost("Test Auction");
  notificationService.showError("Test error message");
}
```

- Verify notifications appear with correct styling
- Test that notifications disappear after their duration expires
- Verify that clicking the X button closes a notification immediately

## Known Limitations for Phase 2

1. **User ID Placeholder**: The code currently uses 'YOUR_USER_ID' as a placeholder. Authentication integration will be completed in a later phase.

2. **WebSocket Events**: Real-time WebSocket events are partially implemented. Phase 3 will complete this integration for truly real-time updates.

3. **Auction Data**: Depends on the availability of auction data in the backend database.

## Reporting Issues

If you encounter any issues during testing, please document them with:
1. Step-by-step reproduction instructions
2. Expected behavior
3. Actual behavior
4. Screenshots or console logs
5. Environment details (browser, operating system) 