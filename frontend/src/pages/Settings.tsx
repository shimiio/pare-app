export default function Settings() {
  return (
    <>
      <h1 className="2xl:text-3xl 2xl:mb-10 font-medium">Settings</h1>

      <div className="mx-2 2xl:space-y-12">
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">Account</h2>
          <div className="mx-3 text-xl space-y-2">
            <div>Username: </div>
            <div>Email: </div>
          </div>
        </div>

        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">Security</h2>
          <div className="mx-3 text-xl space-y-1">
            <button className="hover:underline cursor-pointer">
              Change Password
            </button>
          </div>
        </div>

        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">Preferences</h2>
          <div className="mx-3 text-xl space-y-1">
            <div>
              Currency:
              <select className="cursor-pointer bg-black focus:outline-none ml-2 2xl:text-lg">
                <option value={"EUR"}>€</option>
                <option value={"USD"}>$</option>
                <option value={"UAH"}>₴</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <button className="mt-25 2xl:text-xl text-red-400 hover:bg-red-500/15 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium">
        Delete Account
      </button>
    </>
  );
}
