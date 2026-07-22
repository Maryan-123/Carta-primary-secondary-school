import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const baseTitle = "CARTA Primary & Secondary School";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);
}
