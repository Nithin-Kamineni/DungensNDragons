import { t } from "..";
import { GraphQLPageInfoType } from "./relay-spec";
import type { UserRecord, UserUpdate } from "../../user";

export const queryFields = [
  t.field({
    name: "userStatsStatus",
    type: t.NonNull(t.Boolean),
    // args: {
    //   userName: t.arg(t.String),
    // },
    resolve: (_, __, ctx) => {
      let flagbool=ctx.users.getUserStatus();
      return flagbool
    },
  }), 
];

const GraphQLMapPingInputType = t.inputObjectType({
  name: "UserStatusInput",
  fields: () => ({
    status: {
      type: t.NonNullInput(t.Boolean),
    },
  }),
});

export const mutationFields = [
  t.field({
    name: "userStatus",
    description: "Ping a point on the map.",
    type: t.Boolean,
    args: {
      input: t.arg(t.NonNullInput(GraphQLMapPingInputType)),
    },
    resolve: (_, args, context) => {
      console.log("args.input.status",args.input.status)
      context.users.setUserStatus(args.input.status)
      // context.pubSub.publish("userStatus", "tempID",{
      //   status: args.input.status,
      // });
      context.liveQueryStore.invalidate("Query.userStatsStatus");
      return true;
    },
  }),
];


type UserStatus = {
  status: boolean;
};

const GraphQLUserStatusType = t.objectType<UserStatus>({
  name: "userStatus",
  fields: () => [
    t.field({
      name: "status",
      type: t.NonNull(t.Boolean),
      resolve: (_, args, context) => false,
    }),
  ],
});

export const subscriptionFields = [
  // t.subscriptionField({
  //   name: "userStatus",
  //   type: t.NonNull(GraphQLUserStatusType),
  //   subscribe: (_, args, context) => 
  //   context.pubSub.subscribe("userStatus","tempID")
  // })
];
