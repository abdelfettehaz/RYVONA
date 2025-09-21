declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: (data: any, actions: any) => Promise<string>;
        onApprove: (data: any, actions: any) => Promise<void>;
        onCancel: (data: any) => void;
        onError: (err: any) => void;
      }) => {
        render: (selector: string) => void;
      };
    };
  }
}

export {};
