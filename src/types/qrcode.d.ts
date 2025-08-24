declare module "qrcode" {
  export type QRCodeToDataURLOptions = {
    type?: "image/png" | "image/jpeg" | "image/webp";
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    width?: number;
    scale?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  };

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  const _default: {
    toDataURL: typeof toDataURL;
  };
  export default _default;
}
