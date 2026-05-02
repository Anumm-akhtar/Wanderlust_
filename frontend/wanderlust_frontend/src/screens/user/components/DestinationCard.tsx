import { Card, Tag, Button, Tooltip } from "antd";
import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Destination } from "../services/destinations.service";

const ACCENT = "#aa3bff";

interface Props {
  destination: Destination;
  wishlisted: boolean;
  wishlistLoading?: boolean;
  onToggleWishlist: (dest: Destination) => void;
}

const DestinationCard = ({ destination, wishlisted, wishlistLoading, onToggleWishlist }: Props) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      cover={
        destination.image ? (
          <img
            src={destination.image}
            alt={destination.destName}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
            <EnvironmentOutlined style={{ fontSize: 36, color: "#cbd5e1" }} />
          </div>
        )
      }
      bodyStyle={{ padding: "16px" }}
      className="flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-800 text-base leading-tight line-clamp-1 flex-1">
          {destination.destName}
        </h3>
        <Tooltip title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(destination);
            }}
            disabled={wishlistLoading}
            className="flex-shrink-0 p-1 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {wishlisted ? (
              <HeartFilled style={{ color: ACCENT, fontSize: 18 }} />
            ) : (
              <HeartOutlined style={{ color: "#94a3b8", fontSize: 18 }} />
            )}
          </button>
        </Tooltip>
      </div>

      {destination.description && (
        <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">
          {destination.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <Tag color="purple" className="font-semibold text-sm m-0">
          ${destination.price.toLocaleString()}
        </Tag>
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/destinations/${destination.dest_id}`)}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          View
        </Button>
      </div>
    </Card>
  );
};

export default DestinationCard;
