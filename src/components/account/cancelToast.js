import toast from "react-hot-toast";

export const cancelToast = ({ transactionId, handleCancel }) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-xs w-full bg-gray-800 text-white shadow-md rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              Transaction en cours {transactionId}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-700">
          <button
            onClick={(e) => {
              console.log("canceling transaction", transactionId);
              handleCancel(e, transactionId);
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Annuler
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-left",
    }
  );
};
