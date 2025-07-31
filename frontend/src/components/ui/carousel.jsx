import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "./Carousel.css"; // External CSS

const CarouselContext = React.createContext(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

export const Carousel = React.forwardRef(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
      plugins
    );

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = () => api?.scrollPrev();
    const scrollNext = () => api?.scrollNext();

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    };

    React.useEffect(() => {
      if (api && setApi) setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={`carousel-root ${className || ""}`}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);

export const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="carousel-viewport">
      <div
        ref={ref}
        className={`carousel-container ${orientation === "horizontal" ? "horizontal" : "vertical"} ${className || ""}`}
        {...props}
      />
    </div>
  );
});

export const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={`carousel-item ${orientation === "horizontal" ? "horizontal" : "vertical"} ${className || ""}`}
      {...props}
    />
  );
});

export const CarouselPrevious = React.forwardRef(({ className = "", ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      ref={ref}
      className={`carousel-button prev ${className}`}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      {...props}
    >
      <ArrowLeft size={20} />
      <span className="sr-only">Previous slide</span>
    </button>
  );
});

export const CarouselNext = React.forwardRef(({ className = "", ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      ref={ref}
      className={`carousel-button next ${className}`}
      onClick={scrollNext}
      disabled={!canScrollNext}
      {...props}
    >
      <ArrowRight size={20} />
      <span className="sr-only">Next slide</span>
    </button>
  );
});
