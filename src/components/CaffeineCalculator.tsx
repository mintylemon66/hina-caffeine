import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Coffee } from 'lucide-react';

interface CaffeineEntry {
  date: string;
  time: string;
  amount: number;
}

const CaffeineCalculator = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [entries, setEntries] = useState<CaffeineEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    date: '',
    time: '',
    amount: ''
  });
  const [timeMode, setTimeMode] = useState<'24h' | 'ampm'>('24h');
  const [remainingCaffeine, setRemainingCaffeine] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    calculateRemainingCaffeine();
  }, [entries, currentTime]);

  const calculateRemainingCaffeine = () => {
    const now = currentTime;
    let total = 0;

    entries.forEach(entry => {
      // Parse the entry date and time
      const entryDate = new Date(`${now.getFullYear()}/${entry.date} ${entry.time}`);
      
      // If the entry date is in the future, assume it's from this year
      if (entryDate > now) {
        entryDate.setFullYear(entryDate.getFullYear() - 1);
      }

      // Calculate hours elapsed
      const hoursElapsed = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      
      // Caffeine has a half-life of approximately 6 hours
      // Formula: remaining = initial * (0.5)^(time/halflife)
      if (hoursElapsed >= 0) {
        const remaining = entry.amount * Math.pow(0.5, hoursElapsed / 6);
        total += remaining;
      }
    });

    setRemainingCaffeine(Math.max(0, total));
  };

  const addEntry = () => {
    if (newEntry.date && newEntry.time && newEntry.amount) {
      setEntries([...entries, {
        date: newEntry.date,
        time: newEntry.time,
        amount: parseFloat(newEntry.amount)
      }]);
      setNewEntry({ date: '', time: '', amount: '' });
    }
  };

  const formatCurrentTime = () => {
    if (timeMode === '24h') {
      return currentTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } else {
      return currentTime.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getCaffeineLevel = () => {
    if (remainingCaffeine > 200) return 'Very High';
    if (remainingCaffeine > 100) return 'High';
    if (remainingCaffeine > 50) return 'Moderate';
    if (remainingCaffeine > 10) return 'Low';
    return 'Minimal';
  };

  const getCaffeineLevelColor = () => {
    if (remainingCaffeine > 200) return 'destructive';
    if (remainingCaffeine > 100) return 'secondary';
    if (remainingCaffeine > 50) return 'default';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Current Time Display */}
        <Card className="p-6 text-center shadow-caffeine border-0 bg-card/80 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatCurrentDate()}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-2xl font-mono font-semibold">{formatCurrentTime()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeMode(timeMode === '24h' ? 'ampm' : '24h')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Switch to {timeMode === '24h' ? '12h' : '24h'} format
            </Button>
          </div>
        </Card>

        {/* Caffeine Level Display */}
        <Card className="p-6 text-center shadow-caffeine border-0 bg-card/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Coffee className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-semibold">Current Caffeine Level</h2>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {remainingCaffeine.toFixed(1)} mg
              </div>
              <Badge variant={getCaffeineLevelColor()}>
                {getCaffeineLevel()}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Input Form */}
        <Card className="p-6 shadow-caffeine border-0 bg-card/80 backdrop-blur-sm">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Add Caffeine Entry</h3>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date (MM/DD)</Label>
              <Input
                id="date"
                placeholder="MM/DD"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Time ({timeMode === '24h' ? '24:00' : 'AM/PM'})
              </Label>
              <Input
                id="time"
                placeholder={timeMode === '24h' ? 'HH:MM' : 'HH:MM AM/PM'}
                value={newEntry.time}
                onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Caffeine Amount (mg)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="mg"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
              />
            </div>

            <Button 
              onClick={addEntry} 
              className="w-full shadow-soft transition-smooth"
              disabled={!newEntry.date || !newEntry.time || !newEntry.amount}
            >
              Add Entry
            </Button>
          </div>
        </Card>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card className="p-6 shadow-caffeine border-0 bg-card/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">Recent Entries</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {entries.slice(-3).reverse().map((entry, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded"
                >
                  <span className="font-mono">{entry.date} {entry.time}</span>
                  <span className="font-semibold">{entry.amount}mg</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CaffeineCalculator;