"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import Icon from "../../icons";
import { labHref, rememberedCategory } from "../../lab-category";

/* Nothing to subscribe to: the remembered filter only changes on /lab,
   and this link is never on screen there. */
const subscribe = () => () => {};

/* Back to the list the reader came from, filter included. The server and
   the first client render have no storage to read, so both say /lab, and
   the remembered category takes over once hydrated — the link's text never
   changes, only where it goes. */
export default function LabBackLink() {
  const category = useSyncExternalStore(subscribe, rememberedCategory, () => null);

  return (
    <Link className="case-index note-index" href={labHref(category)}>
      <Icon name="return" />
      Lab
    </Link>
  );
}
