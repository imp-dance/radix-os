---
sidebar_position: 8
---

# FAQ

If you have any issues not found below, please [submit them on Github](https://github.com/imp-dance/radix-os/issues).

## The app I launched is not getting focused

This is likely because you are catching the focus right after launching it with the click event on the button. To fix this, simply call `stopPropagation` on the click event:

```tsx
<Button
  onClick={(e) => {
    e.stopPropagation();
    launch("code");
  }}
>
  Open Code
</Button>
```

This will prevent the click event from bubbling up to the window itself, which will let the launched app catch focus properly.
