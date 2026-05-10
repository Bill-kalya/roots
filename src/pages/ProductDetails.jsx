import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./ProductDetails.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Ebony Queen Mask",

    description:
      "Hand-carved ceremonial mask from Ghanaian Ashanti artisans.",

    longDescription:
      "This ceremonial mask was carved from aged ebony wood by master artisans from the Ashanti region of Ghana. Traditionally used during royal festivals and ancestral ceremonies, every curve symbolizes protection, wisdom, and continuity of heritage.",

    origin: "Kumasi, Ghana",

    artisan:
      "Crafted by Kwaku Mensah, a third-generation wood sculptor.",

    materials: ["Ebony Wood", "Bronze Inlay"],

    dimensions: "48cm x 22cm",

    weight: "3.1kg",

    year: "2025",

    price: 12800,

    gallery: [
      "/mask.jpg",
      "/mask-side.jpg",
      "/mask-back.jpg",
    ],
  },
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = PRODUCTS.find((p) => p.id === Number(id));

  const [activeImage, setActiveImage] = useState(
    product?.gallery?.[0]
  );

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Nav />

      <div className="product-details-page">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="product-layout">
          {/* LEFT */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img
                src={activeImage}
                alt={product.name}
                className="main-product-image"
              />
            </div>

            <div className="thumbnail-row">
              {product.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  className={`thumbnail ${
                    activeImage === img
                      ? "thumbnail-active"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="product-info-panel">
            <div className="product-origin-label">{product.origin}</div>

            <h1 className="details-title">{product.name}</h1>

            <div className="details-price">
              KSh {product.price.toLocaleString()}
            </div>

            <p className="details-description">
              {product.longDescription}
            </p>

            <div className="details-grid">
              <div className="detail-item">
                <span>Artisan</span>
                <strong>{product.artisan}</strong>
              </div>

              <div className="detail-item">
                <span>Weight</span>
                <strong>{product.weight}</strong>
              </div>

              <div className="detail-item">
                <span>Dimensions</span>
                <strong>{product.dimensions}</strong>
              </div>

              <div className="detail-item">
                <span>Year</span>
                <strong>{product.year}</strong>
              </div>
            </div>

            <div className="materials-section">
              <h3>Materials</h3>

              <div className="materials-list">
                {product.materials.map((mat) => (
                  <div key={mat} className="material-chip">
                    {mat}
                  </div>
                ))}
              </div>
            </div>

            <button className="add-cart-large">ADD TO BASKET</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

