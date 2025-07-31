import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "./ui/carousel";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import Autoplay from "embla-carousel-autoplay"; // ✅ import autoplay plugin
import "./Category-Carousel.css";

const categories = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Mobile Developer",
  "Game Developer"
];

const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 1200,
      stopOnInteraction: false,
      stopOnMouseEnter: true, // ✅ stops when mouse hovers anywhere in carousel
    })
  );

  return (
    <div className="category-carousel-container">
      <Carousel className="carousel-wrapper" plugins={[autoplayPlugin.current]}>
        <CarouselContent className="carousel-content">
          {categories.map((category, index) => (
            <CarouselItem key={index} className="carousel-item">
              <button
                className="category-button"
                onClick={() => searchJobHandler(category)}
              >
                {category}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
