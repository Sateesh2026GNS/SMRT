import { Fragment } from "react";
import { numberToWordsInr } from "../../utils/invoiceCopyData";

const cell = "border border-slate-800 px-1.5 py-0.5 text-[11px] leading-tight text-slate-900";
const th = `${cell} font-semibold bg-slate-50`;

function PartyBlock({ title, party }) {
  return (
    <td className={`${cell} align-top w-1/2`} colSpan={1}>
      <p className="font-bold underline mb-1">{title}</p>
      <p className="font-semibold">{party.name}</p>
      <p className="whitespace-pre-wrap">{party.address}</p>
      {party.contact && <p>{party.contact}</p>}
      {party.gstin && <p><span className="font-semibold">GSTIN/UIN :</span> {party.gstin}</p>}
      {party.state && <p><span className="font-semibold">State Name :</span> {party.state}</p>}
    </td>
  );
}

export default function TaxInvoiceCopy({ data, showPrintButton = true }) {
  if (!data) return null;

  const qtyTotal = data.items.reduce((s, it) => s + parseFloat(it.qty || 0), 0);
  const unitLabel = data.items[0]?.unit || "SQM";

  const handlePrint = () => window.print();

  return (
    <div className="tax-invoice-copy mx-auto max-w-[900px] bg-white text-slate-900">
      {showPrintButton && (
        <div className="mb-4 flex gap-2 print:hidden">
          <button type="button" onClick={handlePrint} className="ui-btn-primary text-sm">
            Print Invoice Copy
          </button>
        </div>
      )}

      <div className="border-2 border-slate-800 p-3 print:p-2">
        {/* e-Invoice header row */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="w-24" />
          <h1 className="text-xl font-bold tracking-wide">{data.title}</h1>
          <div className="text-right text-[10px] w-40">
            {data.eInvoice && (
              <>
                <p className="font-bold text-sm mb-1">e-Invoice</p>
                <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center border border-slate-400 bg-slate-100 text-[8px] text-slate-500">
                  QR Code
                </div>
                <p><span className="font-semibold">IRN :</span> <span className="break-all">{data.irn}</span></p>
                <p><span className="font-semibold">Ack No. :</span> {data.ackNo}</p>
                <p><span className="font-semibold">Ack Date :</span> {data.ackDate}</p>
              </>
            )}
          </div>
        </div>

        {/* Seller + invoice meta */}
        <table className="w-full border-collapse mb-0">
          <tbody>
            <tr>
              <td className={`${cell} align-top w-[55%]`} rowSpan={2}>
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-slate-300 bg-blue-50 text-[9px] font-bold text-blue-700">
                    LOGO
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-800">{data.seller.name}</p>
                    {data.seller.tagline && <p className="text-[10px] italic text-blue-600">{data.seller.tagline}</p>}
                    <p className="mt-1">{data.seller.address}</p>
                    {data.seller.udyam && <p>{data.seller.udyam}</p>}
                    <p><span className="font-semibold">GSTIN/UIN :</span> {data.seller.gstin}</p>
                    <p><span className="font-semibold">State Name :</span> {data.seller.state}</p>
                    {data.seller.cin && <p><span className="font-semibold">CIN :</span> {data.seller.cin}</p>}
                    {data.seller.email && <p><span className="font-semibold">E-Mail :</span> {data.seller.email}</p>}
                  </div>
                </div>
              </td>
              <td className={cell}><span className="font-semibold">Invoice No.</span><br />{data.meta.invoiceNo}</td>
              <td className={cell}><span className="font-semibold">Dated</span><br />{data.meta.date}</td>
            </tr>
            <tr>
              <td className={cell}><span className="font-semibold">Delivery Note</span><br />{data.meta.deliveryNote || " "}</td>
              <td className={cell}><span className="font-semibold">Mode/Terms of Payment</span><br />{data.meta.modeTerms}</td>
            </tr>
            <tr>
              <td className={cell}><span className="font-semibold">Reference No. & Date.</span><br />{data.meta.referenceNo || " "}</td>
              <td className={cell}><span className="font-semibold">Other References</span><br /></td>
              <td className={cell}><span className="font-semibold">Buyer's Order No.</span><br />{data.meta.buyersOrderNo || " "}</td>
            </tr>
            <tr>
              <td className={cell}><span className="font-semibold">Dispatch Doc No.</span><br />{data.meta.dispatchDocNo || " "}</td>
              <td className={cell}><span className="font-semibold">Delivery Note Date</span><br /></td>
              <td className={cell}><span className="font-semibold">Dispatched through</span><br />{data.meta.dispatchedThrough}</td>
            </tr>
            <tr>
              <td className={cell}><span className="font-semibold">Destination</span><br />{data.meta.destination}</td>
              <td className={cell} colSpan={2}><span className="font-semibold">Terms of Delivery</span><br />{data.meta.termsOfDelivery || " "}</td>
            </tr>
            <tr>
              <td className={cell} colSpan={3}><span className="font-semibold">e-Way Bill No. :</span> {data.meta.eWayBillNo || " "}</td>
            </tr>
            <tr>
              <PartyBlock title="Consignee (Ship to)" party={data.consignee} />
              <PartyBlock title="Buyer (Bill to)" party={data.buyer} />
            </tr>
            <tr>
              <td className={cell} colSpan={3}>
                <span className="font-semibold">Place of Supply :</span> {data.placeOfSupply}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Line items */}
        <table className="w-full border-collapse mt-0">
          <thead>
            <tr>
              <th className={th}>SI No.</th>
              <th className={`${th} w-[40%]`}>Description of Goods</th>
              <th className={th}>HSN/SAC</th>
              <th className={th}>Quantity</th>
              <th className={th}>Rate</th>
              <th className={th}>per</th>
              <th className={th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <Fragment key={item.si}>
                <tr>
                  <td className={`${cell} text-center`}>{item.si}</td>
                  <td className={cell}><span className="whitespace-pre-wrap font-medium">{item.description}</span></td>
                  <td className={`${cell} text-center`}>{item.hsn}</td>
                  <td className={`${cell} text-right`}>{item.qty}</td>
                  <td className={`${cell} text-right`}>{item.rate}</td>
                  <td className={`${cell} text-center`}>{item.unit}</td>
                  <td className={`${cell} text-right font-medium`}>{item.amount.toFixed(3)}</td>
                </tr>
                {item.igstPct > 0 && (
                  <tr>
                    <td className={cell} />
                    <td className={`${cell} text-right font-semibold`}>IGST</td>
                    <td className={cell} />
                    <td className={cell} />
                    <td className={`${cell} text-right`}>{item.igstPct} %</td>
                    <td className={cell} />
                    <td className={`${cell} text-right`}>{item.igstAmount.toFixed(3)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
            {data.roundOff !== 0 && (
              <tr>
                <td className={cell} colSpan={6} style={{ textAlign: "right", fontWeight: 600 }}>ROUNDED OFF</td>
                <td className={`${cell} text-right`}>(-) {Math.abs(data.roundOff).toFixed(3)}</td>
              </tr>
            )}
            <tr>
              <td className={cell} colSpan={3} style={{ fontWeight: 700 }}>Total</td>
              <td className={`${cell} text-right font-bold`}>{qtyTotal.toFixed(2)} {unitLabel}</td>
              <td className={cell} colSpan={2} />
              <td className={`${cell} text-right font-bold text-base`}>₹ {data.grandTotal.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>

        <p className={`${cell} border-t-0`}>
          <span className="font-semibold">Amount Chargeable (in words)</span><br />
          {numberToWordsInr(data.grandTotal)}
        </p>

        {/* Tax summary */}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th} rowSpan={2}>HSN/SAC</th>
              <th className={th} rowSpan={2}>Taxable Value</th>
              <th className={th} colSpan={2}>IGST</th>
              <th className={th} rowSpan={2}>Total Tax Amount</th>
            </tr>
            <tr>
              <th className={th}>Rate</th>
              <th className={th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={`tax-${item.si}`}>
                <td className={`${cell} text-center`}>{item.hsn}</td>
                <td className={`${cell} text-right`}>{item.amount.toFixed(3)}</td>
                <td className={`${cell} text-center`}>{item.igstPct ? `${item.igstPct}%` : "—"}</td>
                <td className={`${cell} text-right`}>{item.igstAmount.toFixed(3)}</td>
                <td className={`${cell} text-right`}>{item.igstAmount.toFixed(3)}</td>
              </tr>
            ))}
            <tr>
              <td className={`${cell} font-bold`}>Total</td>
              <td className={`${cell} text-right font-bold`}>{data.taxableTotal.toFixed(3)}</td>
              <td className={cell} />
              <td className={`${cell} text-right font-bold`}>{data.igstTotal.toFixed(3)}</td>
              <td className={`${cell} text-right font-bold`}>{data.igstTotal.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>

        <p className={`${cell} border-t-0`}>
          <span className="font-semibold">Tax Amount (in words) :</span> {numberToWordsInr(data.igstTotal)}
        </p>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-0 border border-t-0 border-slate-800">
          <div className={`${cell} text-[9px] leading-snug`}>
            <p className="font-bold mb-1">Declaration</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</li>
              <li>Interest @ 6.24% per annum will be charged on overdue payments.</li>
              <li>Subject to Hyderabad jurisdiction.</li>
            </ol>
            <p className="mt-2 font-semibold">Remarks :</p>
            <p>{data.remarks}</p>
          </div>
          <div className={`${cell} text-[9px] leading-snug`}>
            <p className="font-bold mb-1">Rejection Policy</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Goods must be inspected upon receipt.</li>
              <li>Claims must be made within 7 days of delivery.</li>
              <li>Returns subject to management approval.</li>
            </ol>
            <div className="mt-8 text-right">
              <p className="font-bold">for {data.seller.name.split("-")[0].trim()}</p>
              <p className="mt-10">Authorised Signatory</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between border border-t-0 border-slate-800 px-3 py-2 text-[10px]">
          <span>Prepared by</span>
          <span>Verified by</span>
          <span className="font-semibold">This is a Computer Generated Invoice</span>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .tax-invoice-copy, .tax-invoice-copy * { visibility: visible; }
          .tax-invoice-copy { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
