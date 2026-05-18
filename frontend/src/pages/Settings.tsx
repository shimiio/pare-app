import { useUser } from "../hooks/useUser";
import SettingsForm from "./SettingsForm";

export default function Settings() {
  const { data, isLoading, isError } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;
  if (!data) return <div>No user data</div>;

  return <SettingsForm user={data} />;
}
