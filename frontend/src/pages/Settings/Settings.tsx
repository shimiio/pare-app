import { useUser } from "../../hooks/useUser";
import SettingsForm from "./SettingsForm";
import LoadingState from "#components/ui/LoadingState";
import ErrorState from "#components/ui/ErrorState";

export default function Settings() {
  const { data, isLoading, isError, refetch, isFetching } = useUser();

  if (isLoading) return <LoadingState message="Loading settings" />;
  if (isError)
    return <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />;
  if (!data) return null;

  return <SettingsForm user={data} />;
}
