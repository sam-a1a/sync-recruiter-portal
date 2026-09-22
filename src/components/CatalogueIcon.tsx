import { useState } from "react";
import { Icon } from "./Icon";
import { asset } from "../app/base";
import { languages } from "../catalogues/people";
import {
  brandSource,
  defaultBrand,
  type BrandLogo,
} from "../catalogues/brands";

export function BrandIcon({ name, logo }: { name: string; logo?: BrandLogo }) {
  const source = logo || defaultBrand(name);
  return source ? (
    <BrandImage key={source.slug} brand={source} />
  ) : (
    <Icon
      name={name.toLowerCase().includes("community") ? "group" : "link"}
      size={22}
    />
  );
}
function BrandImage({ brand }: { brand: BrandLogo }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <Icon name="link" size={22} />
  ) : (
    <img
      className="brand-icon"
      src={brandSource(brand)}
      alt=""
      width={24}
      height={24}
      onError={() => setFailed(true)}
    />
  );
}
export function SkillIcon({ name }: { name: string }) {
  if (defaultBrand(name)) return <BrandIcon name={name} />;
  return (
    <Icon
      name={
        /data|meal|analysis|evaluation/i.test(name)
          ? "data_usage"
          : /community|team|staff|engagement|communication/i.test(name)
            ? "group"
            : /train|education|capacity/i.test(name)
              ? "school"
              : /report|proposal|writing/i.test(name)
                ? "description"
                : "work"
      }
      size={22}
    />
  );
}
export function LanguageFlag({ name }: { name: string }) {
  const language = languages.find((l) => l.name === name || l.code === name);
  return language ? (
    <img
      className="language-flag"
      src={asset(`flags/language/${language.flag}.svg`)}
      alt=""
      width={24}
      height={24}
    />
  ) : (
    <Icon name="language" size={24} />
  );
}
export function LanguageTag({ name }: { name: string }) {
  return (
    <span className="language-tag">
      <LanguageFlag name={name} />
      <span>{name}</span>
    </span>
  );
}
