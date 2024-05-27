import { FormEvent, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { addUserEmailToProduct } from "@/lib/actions";

interface Props {
  productId: string;
}

const Modal = ({ productId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addUserEmailToProduct(productId, email);

    setIsSubmitting(false);
    setEmail("");
    closeModal();
  };

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModal} className="dialog-container">
          <div className="fixed inset-0 flex justify-center items-center">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="transition-transform ease-out duration-300"
              enterFrom="translate-y-[-100%]"
              enterTo="translate-y-0"
              leave="transition-transform ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-[-100%]"
            >
              <div className="dialog-content bg-white p-6 rounded-10">
                <div className="flex justify-between items-center mb-3">
                  <div className="p-3 border border-gray-200 rounded-full">
                    <Image
                      src="/assets/icons/logo.svg"
                      alt="logo"
                      width={28}
                      height={28}
                    />
                  </div>

                  <Image
                    src="/assets/icons/x-close.svg"
                    alt="close"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                    onClick={closeModal}
                  />
                </div>

                <h4 className="dialog-head_text">
                  Stay updated with product pricing alerts right in your inbox!
                </h4>

                <p className="text-sm text-gray-600 mt-2">
                  Never miss a bargain again with our timely alerts!
                </p>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="dialog-input_container">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt="mail"
                      width={18}
                      height={18}
                    />

                    <input
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="dialog-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="dialog-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Track"}
                  </button>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
