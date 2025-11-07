function TextInput() {
  return (
    <div className="content-stretch flex h-[55.997px] items-start overflow-clip relative shrink-0" data-name="Text Input">
      <p className="font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[56px] relative shrink-0 text-[#5c4033] text-[48px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        $
      </p>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="content-stretch flex h-[55.997px] items-start overflow-clip relative shrink-0" data-name="Text Input">
      <p className="font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[56px] relative shrink-0 text-[#d4c4b0] text-[48px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        0
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] items-start justify-center relative">
        <TextInput />
        <TextInput1 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[21px] relative shrink-0 w-[64px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[21px] relative w-[64px]">
        <p className="absolute font-['Fredoka:Regular',sans-serif] font-normal leading-[21px] left-[32px] text-[#8b7355] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          US dollars
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[81px] relative shrink-0 w-[222px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[81px] items-center relative w-[222px]">
        <Frame />
        <Paragraph />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[80.978px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[15.992px] h-[80.978px] items-start justify-center relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white h-[130.18px] relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.608px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[130.18px] items-start pb-[0.608px] pt-[24.601px] px-[24.601px] relative w-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[29.989px] relative rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 w-[46.437px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[29.989px] relative w-[46.437px]">
        <p className="absolute font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[18px] left-[11.99px] text-[#5c4033] text-[12px] text-nowrap top-[6.21px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          USD
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[29.989px] relative rounded-[8px] shrink-0 w-[44.993px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[29.989px] relative w-[44.993px]">
        <p className="absolute font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[18px] left-[11.99px] text-[#8b7355] text-[12px] text-nowrap top-[6.21px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          JPY
        </p>
      </div>
    </div>
  );
}

function CurrencyToggle() {
  return (
    <div className="bg-[rgba(255,255,255,0.3)] box-border content-stretch flex gap-[1.995px] h-[33.98px] items-start justify-center pb-0 pl-[1.995px] pr-0 pt-[1.995px] relative rounded-[10px] shrink-0" data-name="CurrencyToggle">
      <Button />
      <Button1 />
    </div>
  );
}

export default function Stepper() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative size-full" data-name="Stepper">
      <Container2 />
      <CurrencyToggle />
    </div>
  );
}