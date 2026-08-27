"use client";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div
      data-awards-heading
      className="mx-auto flex max-w-3xl flex-col items-center text-center"
    >
      <div className="mb-5 flex w-full items-center justify-center gap-4">
        <span
          data-awards-line
          className="h-px w-12 bg-gradient-to-r from-transparent to-slate-400/80 sm:w-20"
          aria-hidden
        />
        <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-slate-600">
          {eyebrow}
        </p>
        <span
          data-awards-line
          className="h-px w-12 bg-gradient-to-l from-transparent to-slate-400/80 sm:w-20"
          aria-hidden
        />
      </div>

      <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        {title}
      </h2>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 md:text-base">
        {description}
      </p>
    </div>
  );
}
