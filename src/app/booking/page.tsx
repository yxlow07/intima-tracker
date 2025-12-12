"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/booking/BookingModal";

type BookingCategory = "discussion" | "music" | "pool" | "pingpong";

type BookingOption = {
  id: BookingCategory;
  title: string;
  desc: string;
  hours: string;
  iconColor: string;
  bgColor: string;
  hoverBorder: string;
  icon: React.ReactNode;
  subTypes?: { id: string; label: string }[];
};

const bookingOptions: BookingOption[] = [
  {
    id: "discussion",
    title: "Discussion Rooms",
    desc: "Private library rooms for study and group discussions.",
    hours: "8am - 6pm",
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100",
    hoverBorder: "group-hover:border-indigo-300",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    subTypes: [
      { id: "ROOM_1", label: "Room 1 (4-5 pax)" },
      { id: "ROOM_2", label: "Room 2 (4-5 pax)" },
      { id: "ROOM_3", label: "Room 3 (8-10 pax)" },
      { id: "ROOM_4", label: "Room 4 (8-10 pax)" },
      { id: "ROOM_5", label: "Room 5 (8-10 pax)" },
    ],
  },
  {
    id: "music",
    title: "Music Room",
    desc: "Soundproof studio room for instrument practice.",
    hours: "8am - 5pm",
    iconColor: "text-rose-600",
    bgColor: "bg-rose-100",
    hoverBorder: "group-hover:border-rose-300",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
  },
  {
    id: "pool",
    title: "Pool Table",
    desc: "1 Large and 1 Small table available for recreation.",
    hours: "8am - 5pm",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
    hoverBorder: "group-hover:border-amber-300",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    subTypes: [
      { id: "LARGE", label: "Large Table" },
      { id: "SMALL", label: "Small Table" },
    ],
  },
  {
    id: "pingpong",
    title: "Ping Pong",
    desc: "2 Tables available. Paddles provided at counter.",
    hours: "8am - 5pm",
    iconColor: "text-teal-600",
    bgColor: "bg-teal-100",
    hoverBorder: "group-hover:border-teal-300",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
];

export default function BookingPage() {
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (option: BookingOption) => {
    setSelectedOption(option);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOption(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <Navbar currentPage="booking" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Book Campus Facilities
          </h1>
        </div>

        <div className="my-5 rounded-xl bg-slate-100 p-6">
          <h3 className="font-semibold text-slate-900">Booking Guidelines</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              All bookings are for 1-hour slots
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              You can book up to 7 days in advance
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Please arrive on time to maximize your slot usage
            </li>
            <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Pool table bookings can only be done on the hour prior to the slot time
            </li>
          </ul>
        </div>

        {/* Booking Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {bookingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCardClick(option)}
              className="group relative flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300"
            >
              {/* Icon */}
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${option.bgColor} ${option.iconColor} transition-colors`}>
                {option.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900">
                {option.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {option.desc}
              </p>

              {/* Hours Badge */}
              <div className="mt-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-slate-500">
                  {option.hours}
                </span>
              </div>

              {/* Arrow indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>        
      </main>

      {/* Booking Modal */}
      {showModal && selectedOption && (
        <BookingModal
          option={selectedOption}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
