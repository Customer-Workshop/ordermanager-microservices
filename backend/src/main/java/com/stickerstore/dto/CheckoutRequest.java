package com.stickerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private String shippingName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingZip;
}
