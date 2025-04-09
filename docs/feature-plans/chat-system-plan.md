# Global Chat System Implementation Plan

## Overview
Implement a real-time global chat system using WebSocket connections to enable players to communicate without refreshing the page.

## WebSocket Event Structure
Based on socket-test.html analysis:

```typescript
// Message Event Structure
interface ChatMessage {
  topic: "CHAT",
  event: {
    type: "CHAT_MESSAGE",
    data: {
      playerId: string;
      playerName: string;
      message: string;
      timestamp: string;
    }
  }
}
```

## Components to Create

### 1. ChatSidebar Component
```typescript
// Location: src/app/components/UI/SidebarContent/Chat.tsx
interface ChatProps {
  isVisible: boolean;
}

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}
```

Features:
- Message list with scroll functionality
- Message input field
- Send button
- Auto-scroll to latest messages
- Message timestamps
- Player name display
- Pixel art styling consistent with game

### 2. ChatMessage Component
```typescript
// Location: src/app/components/UI/Chat/ChatMessage.tsx
interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}
```

## Backend Changes

### 1. Add Chat Events to Realtime Gateway
```typescript
// Add to existing event types
export enum EventType {
  // ... existing events ...
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  CHAT_SYSTEM = 'CHAT_SYSTEM'
}
```

### 2. Chat Message Validation
- Maximum message length: 200 characters
- Rate limiting: 1 message per second per user
- Profanity filtering
- Message format validation

## Frontend Implementation Steps

1. **Create Chat Components**
   - Implement ChatSidebar.tsx
   - Implement ChatMessage.tsx
   - Add to SidebarContent layout

2. **WebSocket Integration**
   ```typescript
   // In realtimeService.ts
   // Add chat subscription method
   subscribeToChat() {
     socket.emit('subscribe', { topic: 'CHAT' });
   }

   // Add send message method
   sendChatMessage(message: string) {
     socket.emit('publish', {
       topic: 'CHAT',
       event: {
         type: 'CHAT_MESSAGE',
         data: {
           message,
           timestamp: new Date().toISOString()
         }
       }
     });
   }
   ```

3. **State Management**
   ```typescript
   // In ChatContext.tsx
   interface ChatContextType {
     messages: Message[];
     sendMessage: (text: string) => void;
     clearMessages: () => void;
   }
   ```

## UI Design

### Chat Sidebar
```
+------------------------+
|     Global Chat        |
+------------------------+
|                        |
| [Message List Area]    |
|                        |
|                        |
|                        |
+------------------------+
| [Message Input    ]    |
| [Send Button]          |
+------------------------+
```

### Message Style
```
Player Name          12:34
Message content here
```

### Styling Guidelines
- Use existing pixel font
- Match game's color scheme
- Maintain 8px/16px grid system
- Use pixel-perfect borders
- Keep retro game aesthetic

## Implementation Order

1. **Phase 1: Basic Chat**
   - Create basic UI components
   - Implement WebSocket connection
   - Add message sending/receiving
   - Basic styling

2. **Phase 2: Enhanced Features**
   - Message persistence
   - User presence indicators
   - Message timestamps
   - Emoji support

3. **Phase 3: Polish**
   - Animations
   - Sound effects
   - Moderation tools
   - Message history

## Testing Plan

1. **Unit Tests**
   - Message formatting
   - WebSocket event handling
   - Component rendering

2. **Integration Tests**
   - WebSocket connection
   - Message flow
   - State management

3. **E2E Tests**
   - Multi-user chat scenarios
   - Connection handling
   - Error scenarios

## Security Considerations

1. **Message Validation**
   - Sanitize input
   - Prevent XSS
   - Rate limiting

2. **Authentication**
   - Verify user tokens
   - Prevent impersonation
   - Track message origins

## Performance Considerations

1. **Message Handling**
   - Limit message history
   - Implement pagination
   - Optimize re-renders

2. **Connection Management**
   - Handle reconnection
   - Message queueing
   - Offline support 