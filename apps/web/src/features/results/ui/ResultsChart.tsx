import { Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { MOCK_DEMARCATION_RESULTS } from "../../../entities/result/mocks/results.mock";
import { translateOptionLabel, useTranslations } from "../../../shared/i18n/translations";
import type { Locale } from "../../../shared/i18n/translations";

interface GlobalChartProps {
  totalVotes: number;
  options: Array<{
    option_id: number;
    label: string;
    votes: number;
  }>;
  lang?: Locale;
}

export function GlobalDonutChart({ totalVotes, options, lang = "ca" }: GlobalChartProps) {
  const t = useTranslations(lang);
  const chartData = options.map((opt) => {
    let nameKey = opt.label;
    if (opt.option_id === 1 || opt.option_id === 2 || opt.option_id === 3) {
      nameKey = translateOptionLabel(opt.label, opt.option_id, lang);
    }

    return {
      name: nameKey,
      value: opt.votes,
      fill: opt.option_id === 1 ? "#16a34a" : opt.option_id === 2 ? "#d20a1e" : "#cbd5e1"
    };
  });

  // Format vote abbreviation (ex: 245.7K)
  const formattedVoterAbbr = (totalVotes >= 1000) 
    ? `${(totalVotes / 1000).toFixed(1)}K`
    : totalVotes.toString();

  const localeMap = {
    ca: "ca-ES",
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    ar: "ar-EG",
    zh: "zh-CN"
  };

  return (
    <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          />
          <Tooltip 
            formatter={(value: any) => [`${new Intl.NumberFormat(localeMap[lang] || "ca-ES").format(value)} ${t("results.chart.votes")}`]}
            contentStyle={{ fontFamily: "Inter", fontSize: "11px", borderRadius: "8px", border: "1px solid #e2dcd0" }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Central Overlay Indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
        <span className="font-outfit text-2xl font-black text-gray-900 leading-none">{formattedVoterAbbr}</span>
        <span className="font-outfit text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("results.chart.votsTotal")}</span>
      </div>
    </div>
  );
}

export function DemarcationBarChart({ lang = "ca" }: { lang?: Locale }) {
  const data = MOCK_DEMARCATION_RESULTS;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            tick={{ fontFamily: "Outfit", fontSize: 11, fontWeight: "bold", fill: "#111827" }} 
            axisLine={{ stroke: "#e2dcd0" }}
          />
          <YAxis 
            tick={{ fontFamily: "Inter", fontSize: 10, fill: "#4b5563" }} 
            axisLine={{ stroke: "#e2dcd0" }}
            unit="%"
          />
          <Tooltip 
            formatter={(value: any) => [`${value}%`]}
            contentStyle={{ fontFamily: "Inter", fontSize: "11px", borderRadius: "8px", border: "1px solid #e2dcd0" }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontFamily: "Outfit", fontSize: "11px", fontWeight: "bold" }}
          />
          <Bar dataKey="si" name={translateOptionLabel("Sí", 1, lang)} fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="no" name={translateOptionLabel("No", 2, lang)} fill="#d20a1e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="blanc" name={translateOptionLabel("En blanc", 3, lang)} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
