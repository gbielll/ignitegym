import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Text } from "@gluestack-ui/themed";
import RNPickerSelect from "react-native-picker-select";

interface DateInputCalendarProps {
    selectedDate: Date | null;
    onDateChange: (date: Date) => void;
    errorMessage?: string;
}

export function DateInputCalendar({ selectedDate, onDateChange, errorMessage }: DateInputCalendarProps) {
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const formatSelectedDate = (date: Date | null) => {
        return date ? date.toISOString().split("T")[0] : "";
    };

    const handleDayPress = (day: DateData) => {
        const newDate = new Date(day.timestamp);
        onDateChange(newDate);
        setCalendarVisible(false);
    };

    const yearOptions = Array.from({ length: 100 }, (_, i) => ({
        label: (new Date().getFullYear() - i).toString(),
        value: new Date().getFullYear() - i,
    }));

    return (
        <View>
            <RNPickerSelect
                onValueChange={(value) => setSelectedYear(value)}
                items={yearOptions}
                placeholder={{ label: "Selecione o ano", value: null }}
            />

            <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                <TextInput
                    value={formatSelectedDate(selectedDate)}
                    placeholder="Selecione uma data"
                    editable={false}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 5,
                    }}
                />
            </TouchableOpacity>

            {errorMessage && (
                <Text style={{ color: "red" }}>{errorMessage}</Text>
            )}

            {calendarVisible && (
                <Calendar
                    current={`${selectedYear}-01-01`} // Mostra o calendário do ano selecionado
                    onDayPress={handleDayPress}
                    markedDates={{
                        [formatSelectedDate(selectedDate)]: { selected: true },
                    }}
                />
            )}
        </View>
    );
}
