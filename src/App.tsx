import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from './components/ui/skeleton';
import { Card, CardContent } from './components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

const GET_VEHICLES = gql`
  query Vehicles($languageCode: String = "ru") {
    vehicles(lang: $languageCode) {
      title
      description
      icons {
        large
        medium
      }
      level
      type {
        name
        title
        icons {
          default
        }
      }
      nation {
        name
        title
        color
        icons {
          small
          medium
          large
        }
      }
    }
  }
`;

interface IVehicle {
  title: string;
  description: string;
  icons: {
    large: string;
    medium: string;
  };
  level: number;
  type: {
    name: string;
    title: string;
    icons: {
      default: string;
    };
  };
  nation: {
    name: string;
    title: string;
    color: string;
    icons: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

type TQueryResponse = {
  vehicles: IVehicle[];
};

function App() {
  const { data, loading, error } = useQuery<TQueryResponse>(GET_VEHICLES);
  const [tier, setTier] = useState('');
  const [nation, setNation] = useState('');
  const [type, setType] = useState('');

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;

  const ships = data?.vehicles || [];

  const filteredShips = ships.filter(
    (ship: IVehicle) =>
      (!tier || ship.level?.toString() === tier) &&
      (!nation || ship.nation?.title === nation) &&
      (!type || ship.type?.title === type)
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <Select onValueChange={(value) => setTier(value === 'none' ? '' : value)} value={tier}>
          <SelectTrigger>
            <SelectValue placeholder="Все уровни" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Все уровни</SelectItem>
            {[...Array(10)].map((_, i) => {
              return (
                <SelectItem key={i} value={(i + 1).toString()}>
                  Уровень {i + 1}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setNation(value === 'none' ? '' : value)} value={nation}>
          <SelectTrigger>
            <SelectValue placeholder="Все нации" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Все нации</SelectItem>
            {[...new Set(ships.map((s: IVehicle) => s.nation?.title).filter(Boolean))].map(
              (nation) => (
                <SelectItem key={nation} value={nation}>
                  {nation}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setType(value === 'none' ? '' : value)} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Все классы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Все классы</SelectItem>
            {[...new Set(ships.map((s: IVehicle) => s.type?.title).filter(Boolean))].map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredShips.length > 0 ? (
          filteredShips.map((ship: IVehicle) => (
            <Card key={ship.title} className="p-4">
              <CardContent>
                {ship.icons?.large ? (
                  <img
                    src={ship.icons.large}
                    alt={ship.title}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <Skeleton className="w-full h-40" />
                )}
                <h2 className="text-lg font-bold mt-2">{ship.title}</h2>
                <p className="text-sm">{ship.description}</p>
                <p className="text-xs text-gray-500">Уровень: {ship.level}</p>
                <p className="text-xs" style={{ color: ship.nation?.color }}>
                  {ship.nation?.title || 'Неизвестная нация'}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center w-full text-gray-500">Нет кораблей, удовлетворяющих фильтру.</p>
        )}
      </div>
    </div>
  );
}

export default App;
