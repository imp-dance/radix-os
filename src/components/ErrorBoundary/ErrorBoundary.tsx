import React, { ReactNode } from "react";

export class ErrorBoundary extends React.Component<
  {
    onError: () => ReactNode;
    children: ReactNode;
  },
  {
    hasError: boolean;
  }
> {
  constructor(props: {
    onError: () => ReactNode;
    children: ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.onError();
    }

    return this.props.children;
  }
}
