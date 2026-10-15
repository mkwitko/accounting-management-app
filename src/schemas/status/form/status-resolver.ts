import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { statusFormSchema, StatusFormSchema } from "./status-form-schema";

export default function StatusForm() {
  const formMethods = useForm<StatusFormSchema>({
    resolver: zodResolver(statusFormSchema),
  });

  return {
    ...formMethods,
  };
}
