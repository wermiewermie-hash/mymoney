import imgGeminiGeneratedImageLyc2Ylyc2Ylyc2Yl1 from "figma:asset/54306542bfc20377c281368aeba8dd257e39d540.png";

function Card() {
  return (
    <div className="absolute bottom-0 h-[133px] left-0 rounded-[24px] w-[327px]" data-name="Card" style={{ backgroundImage: "linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />
      <p className="absolute font-['Fredoka:Medium',sans-serif] font-medium leading-[30px] left-[164px] text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] translate-x-[-50%] w-[238px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        When did you get it?
      </p>
    </div>
  );
}

export default function Splash() {
  return (
    <div className="relative size-full" data-name="splash">
      <Card />
      <div className="absolute h-[116.088px] left-[calc(50%-0.071px)] top-[0.99px] translate-x-[-50%] w-[256.857px]" data-name="Gemini_Generated_Image_lyc2ylyc2ylyc2yl 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[138.58%] left-[-0.11%] max-w-none top-[-17.67%] w-[100.21%]" src={imgGeminiGeneratedImageLyc2Ylyc2Ylyc2Yl1} />
        </div>
      </div>
    </div>
  );
}