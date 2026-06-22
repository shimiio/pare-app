import { useUser } from "../hooks/useUser";
import SettingsForm from "./SettingsForm";

export default function Settings() {
  const { data, isLoading, isError } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;
  if (!data) return null;

  return <SettingsForm user={data} />;
}
