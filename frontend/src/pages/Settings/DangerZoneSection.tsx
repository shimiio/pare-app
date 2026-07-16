import { useMutation, useQueryClient } from "react-query";
import { deleteUser } from "../../api/user";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function DangerZoneSection() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate("/");
    },
  });

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h3>

      <div className="border border-red-900/30 bg-red-950/5 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-200">Delete Account</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Permanently remove your account and all subscription data.
          </p>
        </div>

        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure? This action cannot be undone and you will lose all data.",
              )
            ) {
              deleteMutation.mutate();
            }
          }}
          className="px-4 py-2 bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-medium text-red-400 transition-colors cursor-pointer"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
