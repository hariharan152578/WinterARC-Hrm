export const requestNotificationPermission = () => {
  if (typeof window === 'undefined' || !("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission !== "denied" && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (typeof window === 'undefined' || !("Notification" in window)) {
    return;
  }

  // Prevent showing notifications if the user is already looking at the app tab
  // if (document.hasFocus()) return; // Optional: Uncomment to prevent notifications when active

  if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }
};
