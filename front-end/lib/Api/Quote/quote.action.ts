'use server'

import getQuoteSettings from "../Quote/quote.server";

export async function getQuoteSettingsAction(slug: string) {
  return getQuoteSettings(slug);
}

// export async function createQuoteAction(slug: string){
//   return createQuoteAction();
// }