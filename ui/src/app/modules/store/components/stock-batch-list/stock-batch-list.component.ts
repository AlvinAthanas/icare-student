import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { LedgerTypeObject } from "src/app/shared/resources/store/models/ledger-type.model";
import { StockBatch } from "src/app/shared/resources/store/models/stock-batch.model";
import { StockObject } from "src/app/shared/resources/store/models/stock.model";
import { LedgerFormComponent } from "../../modals/ledger-form/ledger-form.component";

@Component({
  selector: "app-stock-batch-list",
  templateUrl: "./stock-batch-list.component.html",
  styleUrls: ["./stock-batch-list.component.scss"],
})
export class StockBatchListComponent implements OnInit {
  @Input() stock: StockObject;
  @Input() ledgerTypes: LedgerTypeObject[];
  @Input() currentStore: any;
  @Input() saving: boolean;
  @Output() closeBatchList = new EventEmitter<StockObject>();
  @Output() saveLedger = new EventEmitter<LedgerInput>();

  today: Date;
  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.today = new Date();
  }

  onClose(e: Event) {
    e.stopPropagation();
    this.closeBatchList.emit(this.stock);
  }

  onOpenBatchForm(e: Event, operation, stockBatch?: StockBatch) {
    e.stopPropagation();

    const dialog = this.dialog.open(LedgerFormComponent, {
      width: "40%",
      panelClass: "custom-dialog-container",
      data: {
        ledgerTypes: this.ledgerTypes,
        stockBatch,
        stock: this.stock,
        operation,
        storeUuid: this.currentStore?.uuid,
      },
    });

    dialog.afterClosed().subscribe((response: { ledgerInput: LedgerInput }) => {
      if (response?.ledgerInput) {
        this.saveLedger.emit(response.ledgerInput);
      }
    });
  }
}
