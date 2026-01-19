# Dialog and Toast Notification System

## Overview
This application uses a modern notification system with **Dialog** modals for important user decisions and **Toast** notifications for quick feedback.

---

## 🔔 Toast Notifications

### Usage

Toast notifications are perfect for:
- ✅ Success messages (e.g., "Employee created successfully")
- ❌ Error messages (e.g., "Failed to save data")
- ⚠️ Warning messages (e.g., "Please review the form")
- ℹ️ Info messages (e.g., "Session will expire in 5 minutes")

### How to Use

```javascript
import useToastStore from '../store/useToastStore';

function MyComponent() {
  const { success, error, warning, info } = useToastStore();

  const handleSubmit = async () => {
    try {
      await saveData();
      success('Data saved successfully!');
    } catch (err) {
      error('Failed to save data');
    }
  };

  return <button onClick={handleSubmit}>Save</button>;
}
```

### Toast Methods

```javascript
const toast = useToastStore();

// Success notification (green)
toast.success('Operation completed!', 3000); // duration in ms

// Error notification (red)
toast.error('Something went wrong!', 4000);

// Warning notification (yellow)
toast.warning('Please check your input', 3000);

// Info notification (blue)
toast.info('Processing your request...', 2000);

// Custom toast
toast.addToast({
  type: 'success',
  message: 'Custom message',
  duration: 5000
});
```

---

## 📋 Dialog Component

### Usage

Dialogs are perfect for:
- ✅ Confirmation prompts (e.g., "Are you sure you want to delete?")
- ℹ️ Important notifications
- ⚠️ Warning messages that require acknowledgment
- ❌ Error details

### Basic Example

```javascript
import { useState } from 'react';
import Dialog from '../components/Dialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    setShowDialog(true);
  };

  const handleConfirm = () => {
    // Perform deletion
    console.log('Deleted!');
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleConfirm}
      />
    </>
  );
}
```

### Dialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Controls dialog visibility |
| `onClose` | function | required | Callback when dialog closes |
| `title` | string | required | Dialog title |
| `message` | string | required | Dialog message content |
| `type` | string | `'info'` | Type: 'success', 'error', 'warning', 'info' |
| `confirmText` | string | `'OK'` | Confirm button text |
| `cancelText` | string | `'Cancel'` | Cancel button text |
| `showCancel` | boolean | `false` | Show cancel button |
| `onConfirm` | function | optional | Callback when confirmed |

### Dialog Examples

#### Success Dialog
```javascript
<Dialog
  isOpen={isOpen}
  onClose={handleClose}
  title="Success!"
  message="Your data has been saved successfully."
  type="success"
  confirmText="OK"
/>
```

#### Error Dialog
```javascript
<Dialog
  isOpen={isOpen}
  onClose={handleClose}
  title="Error"
  message="Failed to process your request. Please try again."
  type="error"
  confirmText="OK"
/>
```

#### Delete Confirmation
```javascript
<Dialog
  isOpen={isOpen}
  onClose={handleClose}
  title="Delete Employee"
  message="Are you sure you want to delete John Doe? This action cannot be undone."
  type="warning"
  confirmText="Delete"
  cancelText="Cancel"
  showCancel={true}
  onConfirm={handleDelete}
/>
```

---

## 🎨 Visual Design

### Toast Notifications
- Appear in **top-right corner**
- Auto-dismiss after specified duration (default 3000ms)
- Can be manually closed with ✕ button
- Slide-in animation from right
- Color-coded by type (green, red, yellow, blue)

### Dialog Modals
- Center-aligned with backdrop blur
- Icon indicator based on type
- Smooth zoom-in animation
- Keyboard accessible (ESC to close)
- Click outside to close
- Premium rounded design with shadows

---

## ✨ Best Practices

### When to Use Toast
✅ Quick feedback after user actions
✅ Non-critical information
✅ Temporary status updates
✅ Success/failure notifications

### When to Use Dialog
✅ Important decisions (delete, logout)
✅ Critical errors that need acknowledgment
✅ Confirmations that prevent data loss
✅ Blocking operations that need user input

---

## 🔧 Implementation

The ToastContainer is already added to `App.jsx` and renders globally. You just need to use the hooks in your components:

```javascript
// In any component:
import useToastStore from '../store/useToastStore';

const { success } = useToastStore();
success('Welcome!');
```

For dialogs, import and use the Dialog component with state:

```javascript
import Dialog from '../components/Dialog';
import { useState } from 'react';

const [showDialog, setShowDialog] = useState(false);
```

---

## 📦 Files Created

1. `client/src/components/Dialog.jsx` - Reusable dialog component
2. `client/src/components/ToastContainer.jsx` - Toast notification renderer
3. `client/src/store/useToastStore.js` - Toast state management
4. `client/src/App.jsx` - Updated to include ToastContainer

---

## 🎯 Migration from Alerts

**Before (❌ Don't use):**
```javascript
alert('Employee created!');
confirm('Delete this item?');
```

**After (✅ Use instead):**
```javascript
// For notifications
const { success } = useToastStore();
success('Employee created!');

// For confirmations
<Dialog
  isOpen={true}
  title="Confirm"
  message="Delete this item?"
  type="warning"
  showCancel={true}
  onConfirm={handleDelete}
/>
```
