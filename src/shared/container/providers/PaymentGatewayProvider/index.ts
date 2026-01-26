import IPaymentGatewayProvider from "./models/IPaymentGatewayProvider";
import PaymentGatewayProvider from "./implementations/PaymentGatewayProvider";
import { container } from "tsyringe";

container.registerSingleton<IPaymentGatewayProvider>(
  "PaymentGatewayProvider",
  PaymentGatewayProvider,
);
