import ChatClient from "./ChatClient";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Inteligência Eleitoral | Wiki Redecker",
  description: "Assistente de análise dos dados do mandato",
};

export default function ChatPage() {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col overflow-hidden md:-m-6">
      <div className="flex-shrink-0 px-4 py-2 md:px-6">
        <PageBreadcrumb pageTitle="Chat" />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ChatClient />
      </div>
    </div>
  );
}
