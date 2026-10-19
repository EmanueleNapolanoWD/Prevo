export default function CreateClientsPage() {
  return (
    <>
      <h1>Inserisci contatto</h1>

      {/* LISTA CONATTI */}
      {/* nav */}
      <div className="sticky">
        {/* nuovo contatto + import export contatti */}
        <button>Crea contatto</button>
      </div>

      {/* body */}

      <div>
        <form action="">
          {/* INFO CLIENTE */}
          <div>
            {/* seleziona tipo contatto Persona/azienda */}
            <div>
              <select name="" id="">
                <option value="">Persona</option>
                <option value="">Azienda</option>
              </select>
            </div>

            {/* in caso select = persona */}
            <div>
              <div>
                {/* Nome */}
                <label htmlFor="">Nome</label>
                <input type="text" />
                {/* Cgnome */}
                <label htmlFor="">Cognome</label>
                <input type="text" />
                {/* saluto */}
                <select name="" id="">
                  <option value="">Sign.</option>
                  <option value="">Sign.ra</option>
                  <option value="">Coniugi</option>
                  <option value="">Famiglia</option>
                </select>
                {/* email multiple */}
                <div>
                  <label htmlFor="">Email</label>
                  <input type="text" />
                  <button>+</button>
                </div>
                {/* telefono multiplo */}
                <div>
                  <label htmlFor="">Telefono</label>
                  <input type="text" />
                  <button>+</button>
                </div>
                {/* assegan gruppo */}
                <div>
                  <select name="" id="">
                    <option value="">Gruppi caricati</option>
                  </select>
                </div>
              </div>
            </div>

            {/* nota cliente */}
            <label htmlFor="">Nota cliente</label>
            <textarea name="" id=""></textarea>

            {/* info indirizzo multiplo*/}
            <div>
              {/* indirizzo */}
              <div>
                <label htmlFor="">Inserisci indirizzo</label>
                <input type="text" />

                <label htmlFor="">Civico</label>
                <input type="text" required />
              </div>
              {/* supplemento */}
              <label htmlFor="">Supplemento</label>
              <input type="text" />

              {/* cap */}
              <label htmlFor="">CAP</label>
              <input type="text" />
              {/* città */}
              <label htmlFor="">CITTA</label>
              <input type="text" />
              {/* provincia */}
              <label htmlFor="">PROVICNIA</label>
              <input type="text" />
              {/* nazione */}
              <div>
                <select name="" id="" defaultChecked>
                  <option value="">nazioni</option>
                </select>
              </div>
            </div>

            {/* tasse */}
            <div>
              {/* aliquota */}
              <select name="" id="">
                ALiquota fiscale
              </select>
              <option value="">list aaliquote</option>

              {/* p.iva */}
              <label htmlFor="">P.Iva</label>
              <input type="text" />

              {/* codice fiscale */}
              <label htmlFor="">Codice Fiscale</label>
              <input type="text" />

              {/* pec */}
              <label htmlFor="">Pec</label>
              <input type="text" />

              {/* pec */}
              <label htmlFor="">Pec</label>
              <input type="text" />
            </div>
          </div>

          {/* in caso azioenda */}
          <div>
            <div>
              {/* Nome */}
              <label htmlFor="">Nome Azienda</label>
              <input type="text" />
              {/* email multiple */}
              <div>
                <label htmlFor="">Email</label>
                <input type="text" />
                <button>+</button>
              </div>
              {/* telefono multiplo */}
              <div>
                <label htmlFor="">Telefono</label>
                <input type="text" />
                <button>+</button>
              </div>
              {/* sito web */}
              <div>
                <label htmlFor="">sito web</label>
                <input type="text" />
              </div>
              {/* assegan gruppo */}
              <div>
                <select name="" id="">
                  <option value="">Gruppi caricati</option>
                </select>
              </div>
            </div>
          </div>

          {/* nota cliente */}
          <label htmlFor="">Nota cliente</label>
          <textarea name="" id=""></textarea>

          {/* info indirizzo multiplo*/}
          <div>
            {/* indirizzo */}
            <div>
              <label htmlFor="">Inserisci indirizzo</label>
              <input type="text" />

              <label htmlFor="">Civico</label>
              <input type="text" required />
            </div>
            {/* supplemento */}
            <label htmlFor="">Supplemento</label>
            <input type="text" />

            {/* cap */}
            <label htmlFor="">CAP</label>
            <input type="text" />
            {/* città */}
            <label htmlFor="">CITTA</label>
            <input type="text" />
            {/* provincia */}
            <label htmlFor="">PROVICNIA</label>
            <input type="text" />
            {/* nazione */}
            <div>
              <select name="" id="" defaultChecked>
                <option value="">nazioni</option>
              </select>
            </div>
          </div>

          {/* tasse */}
          <div>
            {/* aliquota */}
            <select name="" id="">
              ALiquota fiscale
            </select>
            <option value="">list aaliquote</option>

            {/* p.iva */}
            <label htmlFor="">P.Iva</label>
            <input type="text" />

            {/* codice fiscale */}
            <label htmlFor="">Codice Fiscale</label>
            <input type="text" />

            {/* pec */}
            <label htmlFor="">Pec</label>
            <input type="text" />

            {/* pec */}
            <label htmlFor="">Pec</label>
            <input type="text" />
          </div>
        </form>
      </div>
    </>
  );
}
