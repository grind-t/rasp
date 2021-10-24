import Head from "next/head";
import { Container, Autocomplete, Box, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import DataGridWithPopover from "../components/data-grid-with-popover";
import { GridToolbar } from "@mui/x-data-grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ruRU } from "@mui/x-data-grid";
import { useInterval } from "ahooks";
import {
  getPairDayName,
  getPairDayNumber,
  getPairNumber,
  getPairWeekNumber,
} from "../lib/date";

const dataGridTheme = createTheme(ruRU);
const dataGridColumns = [
  {
    field: "day",
    headerName: "День",
    minWidth: 110,
  },
  {
    field: "time",
    headerName: "Время",
    minWidth: 120,
  },
  {
    field: "week",
    headerName: "Неделя",
  },
  {
    field: "group",
    headerName: "Группа",
  },
  { field: "subject", headerName: "Предмет", minWidth: 200, flex: 4 },
  {
    field: "teacher",
    headerName: "Преподаватель",
    minWidth: 150,
    flex: 2,
  },
  { field: "aud", headerName: "Аудитория" },
];

export default function Home() {
  const { data: teacherList } = useSWRImmutable("teacher/list");
  const { data: audList } = useSWRImmutable("aud/list");
  const { data: groupList } = useSWRImmutable("group/list");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAud, setSelectedAud] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [date, setDate] = useState(() => new Date());

  const teacherOptions = useMemo(
    () =>
      teacherList
        ? teacherList.map((teacher) => ({
            label: teacher.full_name,
            value: teacher,
          }))
        : [],
    [teacherList]
  );
  const audOptions = useMemo(
    () =>
      audList
        ? audList.map((aud) => ({
            label: aud.aud,
            value: aud,
          }))
        : [],
    [audList]
  );
  const groupOptions = useMemo(
    () =>
      groupList
        ? Object.entries(groupList).map(([groupName, group]) => ({
            label: groupName,
            value: group,
          }))
        : [],
    [groupList]
  );

  const { data } = useSWRImmutable(() => {
    if (selectedTeacher) return "teacher?id=" + selectedTeacher.value.teacherid;
    if (selectedAud) return "aud?id=" + selectedAud.value.audid;
    if (selectedGroup) return "group?id=" + selectedGroup.value.groupid;
    return null;
  });

  const pairs = useMemo(() => {
    const result = [];
    if (!data) return result;
    let id = 0;
    const days = data.day;
    for (const day of days) {
      const pairList = day.pairList;
      if (!pairList.length) continue;
      for (const pair of pairList) {
        const pairsByWeek = pair.pair;
        if (!pairsByWeek.length) continue;
        for (const pairByWeek of pairsByWeek) {
          if (!Object.keys(pairByWeek).length) continue;
          result.push({
            id: id++,
            week: pairByWeek.week === 0 ? "1, 2" : pairByWeek.week,
            day: day.name,
            time: pair.pairtime,
            group: data.group || pairByWeek.group.join(", "),
            subject: pairByWeek.subject,
            teacher: data.teacher || pairByWeek.teacher,
            aud: data.aud || pairByWeek.aud,
            dayNumber: day.number,
            pairNumber: pair.pairnumber,
            weekNumber: pairByWeek.week,
          });
        }
      }
    }
    return result;
  }, [data]);

  const pairDayNumber = getPairDayNumber(date);
  const pairNumber = getPairNumber(date);
  const pairWeekNumber = getPairWeekNumber(date);

  const todayPairs = useMemo(
    () =>
      pairs.filter(
        (p) =>
          p.dayNumber === pairDayNumber &&
          (p.weekNumber === 0 || p.weekNumber === pairWeekNumber)
      ),
    [pairs, pairDayNumber, pairWeekNumber]
  );

  const upcomingPair = useMemo(
    () => todayPairs.find((p) => p.pairNumber >= pairNumber),
    [todayPairs, pairNumber]
  );

  const initialDataGridState = useMemo(
    () => ({
      filter: {
        filterModel: {
          items: [
            {
              columnField: "day",
              operatorValue: "equals",
              value: getPairDayName(pairDayNumber),
            },
            {
              columnField: "week",
              operatorValue: "contains",
              value: pairWeekNumber.toString(),
            },
          ],
        },
      },
    }),
    [pairDayNumber, pairWeekNumber]
  );

  useInterval(() => setDate(new Date()), 60000);

  return (
    <Container maxWidth="xl">
      <Head>
        <title>Расписание</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          mx: -1,
          my: 1,
        }}
      >
        <Autocomplete
          value={selectedTeacher}
          options={teacherOptions}
          onChange={(_event, newValue) => setSelectedTeacher(newValue)}
          disabled={!!(selectedAud || selectedGroup)}
          sx={{ minWidth: "30ch", m: 1, flex: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Поиск по преподавателю" />
          )}
        />
        <Autocomplete
          value={selectedAud}
          options={audOptions}
          onChange={(_event, newValue) => setSelectedAud(newValue)}
          disabled={!!(selectedTeacher || selectedGroup)}
          sx={{ minWidth: "30ch", m: 1, flex: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Поиск по аудитории" />
          )}
        />
        <Autocomplete
          value={selectedGroup}
          options={groupOptions}
          onChange={(_event, newValue) => setSelectedGroup(newValue)}
          disabled={!!(selectedTeacher || selectedAud)}
          sx={{ minWidth: "30ch", m: 1, flex: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Поиск по группе" />
          )}
        />
      </Box>
      <ThemeProvider theme={dataGridTheme}>
        <DataGridWithPopover
          rows={pairs}
          columns={dataGridColumns}
          selectionModel={upcomingPair ? [upcomingPair.id] : []}
          initialState={initialDataGridState}
          components={{
            Toolbar: GridToolbar,
          }}
          hideFooterSelectedRowCount
        />
      </ThemeProvider>
    </Container>
  );
}
