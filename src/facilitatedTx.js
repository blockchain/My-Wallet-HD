'use strict';

class FacilitatedTx {
  constructor (o) {
    this.id = o.id;
    this.state = o.state;
    this.intended_amount = o.intended_amount;
    this.address = o.address;
    this.tx_hash = o.tx_hash;
    this.role = o.role;
    this.note = o.note;
    this.created = o.created;
    this.last_updated = o.last_updated;
  }
}

// create a Request for a Payment Request
FacilitatedTx.RPR = function (intendedAmount, id, role, note) {
  return new FacilitatedTx(
    {
      state: FacilitatedTx.WAITING_ADDRESS,
      intended_amount: intendedAmount,
      role: role,
      id: id,
      note: note,
      created: Date.now(),
      last_updated: Date.now()
    });
};

// create a payment request
FacilitatedTx.PR = function (intendedAmount, id, role, address, note) {
  return new FacilitatedTx(
    {
      state: FacilitatedTx.WAITING_PAYMENT,
      intended_amount: intendedAmount,
      role: role,
      id: id,
      address: address,
      note: note,
      created: Date.now(),
      last_updated: Date.now()
    });
};

FacilitatedTx.factory = function (o) {
  return new FacilitatedTx(o);
};
// ftx roles
FacilitatedTx.RPR_INITIATOR = 'rpr_initiator';
FacilitatedTx.RPR_RECEIVER = 'rpr_receiver';
FacilitatedTx.PR_INITIATOR = 'pr_initiator';
FacilitatedTx.PR_RECEIVER = 'pr_receiver';

// ftx states
FacilitatedTx.WAITING_ADDRESS = 'waiting_address';
FacilitatedTx.WAITING_PAYMENT = 'waiting_payment';
FacilitatedTx.PAYMENT_BROADCASTED = 'payment_broadcasted';
FacilitatedTx.DECLINED = 'declined'
FacilitatedTx.CANCELLED = 'cancelled'

module.exports = FacilitatedTx;
