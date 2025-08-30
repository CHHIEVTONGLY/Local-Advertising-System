import Link from "next/link";
import AdCard from "../components/dashboardComponent/AdsComponent";
import axios from "axios";
import { cookies } from "next/headers";
import { AdsType } from "../types/AdsType";

const getUserHistoryData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const adsResponse = await axios.get(
      `${process.env.ADS_SERVICE_URL}/api/ads/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return adsResponse.data;
  } catch (error) {
    console.error("Error fetching user history data:", error);
    return { data: [] };
  }
};

export default async function Dashboard() {
  const history: { data: AdsType[] } = await getUserHistoryData();
  return (
    <div className="py-10 max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Ads Dashboard</h1>
        <Link
          href="/publish"
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-medium"
        >
          + Create New Ad
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.data.map((ad: AdsType) => (
          <AdCard key={ad._id} ad={ad} />
        ))}
      </div>
    </div>
  );
}
