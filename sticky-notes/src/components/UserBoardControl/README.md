# UserBoardControl Module

A comprehensive React module for managing boards and user assignments in your sticky notes application. This module provides three main components that maintain consistency with your existing note styling.

## Components

### 1. BoardCreation
A modal component for creating new boards with:
- Board name and description fields
- Public/private board options
- Form validation and error handling
- Consistent sticky note styling

**Props:**
- `onBoardCreated` (function): Callback when board is successfully created
- `currentUser` (object): Current user information

### 2. UserAssignment
A component for managing user permissions on boards:
- Search and select users to assign
- Role-based permissions (viewer, editor, admin)
- Remove user assignments
- Real-time user list updates

**Props:**
- `boardId` (string/number): ID of the board to manage
- `currentUser` (object): Current user information
- `onAssignmentChanged` (function): Callback when assignments change

### 3. UserControlPanel
Main dashboard for user board management:
- View and manage your boards
- Browse public boards
- Create new boards
- Manage user assignments
- Leave or delete boards

**Props:**
- `currentUser` (object): Current user information
- `onUserUpdated` (function): Callback for user actions

## Usage

```jsx
import { BoardCreation, UserAssignment, UserControlPanel } from './components/UserBoardControl';

// Use individual components
<UserControlPanel 
  currentUser={currentUser} 
  onUserUpdated={handleUserUpdate} 
/>

<BoardCreation 
  onBoardCreated={handleBoardCreated} 
  currentUser={currentUser} 
/>

<UserAssignment 
  boardId={boardId} 
  currentUser={currentUser} 
  onAssignmentChanged={handleAssignmentChange} 
/>
```

## Features

- **Consistent Styling**: All components use the same `NoteDefault` styling as your existing sticky notes
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Proper loading indicators for async operations
- **Role Management**: Support for viewer, editor, and admin roles
- **Real-time Updates**: Components update based on user actions

## API Integration

The components are designed to work with your existing API structure:
- Uses `getApiUrl` utility for consistent endpoint paths
- Includes proper authentication headers
- Handles different response types (JSON, 204 No Content)

## Styling

All components maintain the same visual design language as your sticky notes:
- Times New Roman font family
- Consistent color scheme and opacity
- Smooth transitions and hover effects
- Glass-morphism effects with backdrop filters
